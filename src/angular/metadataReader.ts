import * as ts from 'typescript';
import { FileResolver } from './fileResolver/fileResolver';
import { AbstractResolver, MetadataUrls } from './urlResolvers/abstractResolver';
import { UrlResolver } from './urlResolvers/urlResolver';
import { PathResolver } from './urlResolvers/pathResolver';

import { logger } from '../util/logger';

import { Config } from './config';

import {
  DirectiveMetadata, ComponentMetadata, CodeWithSourceMap, TemplateMetadata, StylesMetadata,
  StyleMetadata
} from './metadata';
import { Maybe, unwrapFirst, ifTrue, listToMaybe } from '../util/function';
import {
  callExpression, withIdentifier, hasProperties,
  isSimpleTemplateString, getStringInitializerFromProperty, decoratorArgument
} from '../util/astQuery';
import { getTemplate, getInlineStyle } from '../util/ngQuery';

const normalizeTransformed = (t: CodeWithSourceMap) => {
  if (!t.map) {
    t.source = t.code;
  }
  return t;
};


/**
 * For async implementation https://gist.github.com/mgechev/6f2245c0dfb38539cc606ea9211ecb37
 */
export class MetadataReader {

  constructor(private _fileResolver: FileResolver, private _urlResolver?: AbstractResolver) {
    this._urlResolver = this._urlResolver || new UrlResolver(new PathResolver());
  }

  read(d: ts.ClassDeclaration): DirectiveMetadata {
    let componentMetadata = unwrapFirst(
      (d.decorators || ([] as ts.Decorator[])).map((dec: ts.Decorator) => {
        return Maybe.lift(dec).bind(callExpression)
          .bind(withIdentifier('Component'))
          .fmap(() => this.readComponentMetadata(d, dec));
      }));

    let directiveMetadata = unwrapFirst(
      (d.decorators || ([] as ts.Decorator[])).map((dec: ts.Decorator) =>
        Maybe.lift(dec)
          .bind(callExpression)
          .bind(withIdentifier('Directive'))
          .fmap(() => this.readDirectiveMetadata(d, dec))
      ));

    return directiveMetadata || componentMetadata || undefined;
  }

  protected readDirectiveMetadata(d: ts.ClassDeclaration, dec: ts.Decorator): DirectiveMetadata {
    const selector = this.getDecoratorArgument(dec)
      .bind(expr => getStringInitializerFromProperty('selector', expr.properties))
      .fmap(initializer => initializer.text);

    return Object.assign(new DirectiveMetadata(), {
      controller: d,
      decorator: dec,
      selector: selector.unwrap(),
    });
  }

  protected readComponentMetadata(d: ts.ClassDeclaration, dec: ts.Decorator): ComponentMetadata {
    const expr = this.getDecoratorArgument(dec);
    const directiveMetadata = this.readDirectiveMetadata(d, dec);

    const external_M = expr.fmap(() => this._urlResolver.resolve(dec));

    const template_M: Maybe<TemplateMetadata> = external_M.bind(external =>
      this.readComponentTemplateMetadata(dec, external));
    const style_M: Maybe<StylesMetadata> = external_M.bind(external =>
      this.readComponentStylesMetadata(dec, external));

    return Object.assign(new ComponentMetadata(), directiveMetadata, {
      template: template_M.unwrap(),
      styles: style_M.unwrap(),
    });
  }

  protected getDecoratorArgument(decorator: ts.Decorator): Maybe<ts.ObjectLiteralExpression> {
    return decoratorArgument(decorator)
      .bind(ifTrue(hasProperties));
  }

  protected readComponentTemplateMetadata(dec: ts.Decorator, external: MetadataUrls): Maybe<TemplateMetadata> {
    // Resolve Inline template
    return getTemplate(dec)
      .fmap(inlineTemplate => ({
          template: normalizeTransformed(Config.transformTemplate(inlineTemplate.text, null, dec)),
          url: null,
          node: inlineTemplate,
        })
      ).catch(() =>  // If there's no valid inline template, we resolve external template
        Maybe.lift(external.templateUrl)
          .bind(url =>
            this._resolve(url).fmap(template => ({
              template: normalizeTransformed(Config.transformTemplate(template, url, dec)),
              url,
              node: null
            }))
          )
      );
  }

  protected readComponentStylesMetadata(dec: ts.Decorator, external: MetadataUrls): Maybe<StylesMetadata> {
    return getInlineStyle(dec).fmap(inlineStyles =>
      // Resolve Inline styles
      inlineStyles.elements.map((inlineStyle: ts.Expression) => {
        if (isSimpleTemplateString(inlineStyle)) {
          return {
            style: normalizeTransformed(Config.transformStyle(inlineStyle.text, null, dec)),
            url: null,
            node: inlineStyle as ts.Node,
          };
        }
      }).filter(v => !!v)
    ).catch(() =>  // If there's no valid inline styles, we resolve external styles
      Maybe.lift(external.styleUrls)
        .fmap(urls => urls.map(url =>  // Resolve each style URL and transform to metadata
          this._resolve(url).fmap(style => ({
            style: normalizeTransformed(Config.transformStyle(style, url, dec)),
            url,
            node: null,
          }))
        ))
        // merge Maybe<StyleMetadata>[] to Maybe<StyleMetadata[]>
        .bind(url_Ms => listToMaybe<StyleMetadata>(url_Ms))
    );
  }

  private _resolve(url: string): Maybe<string> {
    try {
      return Maybe.lift(this._fileResolver.resolve(url));
    } catch (e) {
      logger.info('Cannot read file' + url);
      return Maybe.nothing;
    }
  }
}
