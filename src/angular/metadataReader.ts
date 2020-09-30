import * as ts from 'typescript';
import { callExpression, decoratorArgument, hasProperties, withIdentifier } from '../util/astQuery';
import { ifTrue, listToMaybe, Maybe, unwrapFirst } from '../util/function';
import { logger } from '../util/logger';
import { getAnimations, getInlineStyle, getTemplate } from '../util/ngQuery';
import { getDecoratorPropertyInitializer, isBooleanLiteralLike, isStringLiteralLike, maybeNodeArray } from '../util/utils';
import { Config } from './config';
import { FileResolver } from './fileResolver/fileResolver';
import {
  AnimationMetadata,
  CodeWithSourceMap,
  ComponentMetadata,
  DirectiveMetadata,
  InjectableMetadata,
  ModuleMetadata,
  PipeMetadata,
  StyleMetadata,
  TemplateMetadata,
} from './metadata';
import { AbstractResolver, MetadataUrls } from './urlResolvers/abstractResolver';
import { PathResolver } from './urlResolvers/pathResolver';
import { UrlResolver } from './urlResolvers/urlResolver';

const normalizeTransformed = (t: CodeWithSourceMap): CodeWithSourceMap => {
  if (!t.map) {
    t.source = t.code;
  }
  return t;
};

/**
 * For async implementation https://gist.github.com/mgechev/6f2245c0dfb38539cc606ea9211ecb37
 */
export class MetadataReader {
  constructor(private readonly fileResolver: FileResolver, private readonly urlResolver?: AbstractResolver) {
    this.urlResolver = this.urlResolver || new UrlResolver(new PathResolver());
  }

  read(d: ts.ClassDeclaration): DirectiveMetadata | ComponentMetadata | PipeMetadata | ModuleMetadata | InjectableMetadata | undefined {
    const componentMetadata = unwrapFirst<ComponentMetadata | undefined>(
      maybeNodeArray(ts.createNodeArray(d.decorators)).map((dec) => {
        return Maybe.lift(dec)
          .bind(callExpression)
          .bind(withIdentifier('Component') as any)
          .fmap(() => this.readComponentMetadata(d, dec));
      })
    );

    const directiveMetadata = unwrapFirst<DirectiveMetadata | undefined>(
      maybeNodeArray(ts.createNodeArray(d.decorators)).map((dec) =>
        Maybe.lift(dec)
          .bind(callExpression)
          .bind(withIdentifier('Directive') as any)
          .fmap(() => this.readDirectiveMetadata(d, dec))
      )
    );

    const pipeMetadata = unwrapFirst<PipeMetadata | undefined>(
      maybeNodeArray(ts.createNodeArray(d.decorators)).map((dec) =>
        Maybe.lift(dec)
          .bind(callExpression)
          .bind(withIdentifier('Pipe') as any)
          .fmap(() => this.readPipeMetadata(d, dec))
      )
    );

    const moduleMetadata = unwrapFirst<ModuleMetadata | undefined>(
      maybeNodeArray(ts.createNodeArray(d.decorators)).map((dec) =>
        Maybe.lift(dec)
          .bind(callExpression)
          .bind(withIdentifier('NgModule') as any)
          .fmap(() => this.readModuleMetadata(d, dec))
      )
    );

    const injectableMetadata = unwrapFirst<InjectableMetadata | undefined>(
      maybeNodeArray(ts.createNodeArray(d.decorators)).map((dec) =>
        Maybe.lift(dec)
          .bind(callExpression)
          .bind(withIdentifier('Injectable') as any)
          .fmap(() => this.readInjectableMetadata(d, dec))
      )
    );

    return directiveMetadata || componentMetadata || pipeMetadata || moduleMetadata || injectableMetadata;
  }

  protected readDirectiveMetadata(d: ts.ClassDeclaration, dec: ts.Decorator): DirectiveMetadata {
    const selectorExpression = getDecoratorPropertyInitializer(dec, 'selector');
    const selector = selectorExpression && isStringLiteralLike(selectorExpression) ? selectorExpression.text : undefined;

    return new DirectiveMetadata(d, dec, selector);
  }

  protected readPipeMetadata(d: ts.ClassDeclaration, dec: ts.Decorator): DirectiveMetadata {
    const nameExpression = getDecoratorPropertyInitializer(dec, 'name');
    const name = nameExpression && isStringLiteralLike(nameExpression) ? nameExpression.text : undefined;

    const pureExpression = getDecoratorPropertyInitializer(dec, 'pure');
    const pure = pureExpression && isBooleanLiteralLike(pureExpression) ? pureExpression : undefined;

    return new PipeMetadata(d, dec, name, pure);
  }

  protected readModuleMetadata(d: ts.ClassDeclaration, dec: ts.Decorator): DirectiveMetadata {
    return new ModuleMetadata(d, dec);
  }

  protected readInjectableMetadata(d: ts.ClassDeclaration, dec: ts.Decorator): DirectiveMetadata {
    const providedInExpression = getDecoratorPropertyInitializer(dec, 'providedIn');

    return new InjectableMetadata(d, dec, providedInExpression);
  }

  protected readComponentMetadata(d: ts.ClassDeclaration, dec: ts.Decorator): ComponentMetadata {
    const expr = this.getDecoratorArgument(dec);
    const directiveMetadata = this.readDirectiveMetadata(d, dec);
    const external_M = expr.fmap(() => this.urlResolver!.resolve(dec));
    const animations_M = external_M.bind(() => this.readComponentAnimationsMetadata(dec));
    const style_M = external_M.bind((external) => this.readComponentStylesMetadata(dec, external!));
    const template_M = external_M.bind((external) => this.readComponentTemplateMetadata(dec, external!));

    return new ComponentMetadata(
      directiveMetadata.controller,
      directiveMetadata.decorator,
      directiveMetadata.selector,
      animations_M.unwrap(),
      style_M.unwrap(),
      template_M.unwrap()
    );
  }

  protected getDecoratorArgument(decorator: ts.Decorator): Maybe<ts.ObjectLiteralExpression | undefined> {
    return decoratorArgument(decorator).bind(ifTrue(hasProperties));
  }

  protected readComponentAnimationsMetadata(dec: ts.Decorator): Maybe<(AnimationMetadata | undefined)[] | undefined> {
    return getAnimations(dec).fmap((inlineAnimations) =>
      inlineAnimations!.elements.filter(isStringLiteralLike).map<AnimationMetadata>((inlineAnimation) => ({
        animation: normalizeTransformed({ code: (inlineAnimation as ts.StringLiteral).text }),
        node: inlineAnimation as ts.Node,
      }))
    );
  }

  protected readComponentTemplateMetadata(dec: ts.Decorator, external: MetadataUrls): Maybe<TemplateMetadata | undefined> {
    // Resolve Inline template
    return getTemplate(dec)
      .fmap<TemplateMetadata>((inlineTemplate) => ({
        node: inlineTemplate,
        template: normalizeTransformed(Config.transformTemplate(inlineTemplate!.text)),
        url: undefined,
      }))
      .catch(() =>
        // If there's no valid inline template, we resolve external template
        Maybe.lift(external.templateUrl).bind((url) =>
          this._resolve(url!).fmap<TemplateMetadata>((template) => ({
            node: undefined,
            template: normalizeTransformed(Config.transformTemplate(template!, url)),
            url,
          }))
        )
      );
  }

  protected readComponentStylesMetadata(dec: ts.Decorator, external: MetadataUrls): Maybe<(StyleMetadata | undefined)[] | undefined> {
    return getInlineStyle(dec)
      .fmap((inlineStyles) =>
        // Resolve Inline styles
        inlineStyles!.elements.filter(isStringLiteralLike).map<StyleMetadata>((inlineStyle) => ({
          node: inlineStyle,
          style: normalizeTransformed(Config.transformStyle((inlineStyle as ts.StringLiteral).text)),
        }))
      )
      .catch(() =>
        // If there's no valid inline styles, we resolve external styles
        Maybe.lift(external.styleUrls)
          .fmap((urls) =>
            urls.map((
              url // Resolve each style URL and transform to metadata
            ) =>
              this._resolve(url).fmap<StyleMetadata>((style) => ({
                node: undefined,
                style: normalizeTransformed(Config.transformStyle(style!, url)),
                url,
              }))
            )
          )
          // merge Maybe<StyleMetadata>[] to Maybe<StyleMetadata[]>
          .bind((url) => listToMaybe(url as any) as any)
      );
  }

  private _resolve(url: string): Maybe<string | undefined> {
    try {
      return Maybe.lift(this.fileResolver.resolve(url));
    } catch {
      logger.info('Cannot read file' + url);
      return Maybe.nothing;
    }
  }
}
