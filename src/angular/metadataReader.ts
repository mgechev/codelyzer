import * as ts from 'typescript';
import {current} from '../util/syntaxKind';

import {FileResolver} from './fileResolver/fileResolver';
import {AbstractResolver, MetadataUrls} from './urlResolvers/abstractResolver';
import {UrlResolver} from './urlResolvers/urlResolver';
import {PathResolver} from './urlResolvers/pathResolver';

import {logger} from '../util/logger';
import {isSimpleTemplateString, getDecoratorPropertyInitializer} from '../util/utils';

import {Config} from './config';

import {DirectiveMetadata, ComponentMetadata, StylesMetadata, CodeWithSourceMap} from './metadata';

const kinds = current();

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
    this._urlResolver  = this._urlResolver || new UrlResolver(new PathResolver());
  }

  read(d: ts.ClassDeclaration): DirectiveMetadata {
    let directiveDecorator: ts.Decorator = null;
    let componentDecorator: ts.Decorator = null;
    (d.decorators || ([] as ts.Decorator[])).forEach((dec: ts.Decorator) => {
      let expr = dec.expression;
      if (expr && expr.kind === kinds.CallExpression && (<ts.CallExpression>expr).expression) {
        expr = (<ts.CallExpression>expr).expression;
      }
      const identifier = (<ts.Identifier>expr);
      if (expr && expr.kind === kinds.Identifier && identifier.text) {
        if (identifier.text === 'Component') {
          componentDecorator = dec;
        } else if (identifier.text === 'Directive') {
          directiveDecorator = dec;
        }
      }
    });
    if (directiveDecorator) {
      return this.readDirectiveMetadata(d, directiveDecorator);
    }
    if (componentDecorator) {
      return this.readComponentMetadata(d, componentDecorator);
    }
    return null;
  }

  readDirectiveMetadata(d: ts.ClassDeclaration, dec: ts.Decorator) {
    const expr = this.getDecoratorArgument(dec);
    const metadata = new DirectiveMetadata();
    metadata.controller = d;
    metadata.decorator = dec;
    if (!expr) {
      return metadata;
    }
    expr.properties.forEach((p: any) => {
      if (p.kind !== kinds.PropertyAssignment) {
        return;
      }
      const prop = <ts.PropertyAssignment>p;
      if ((<any>prop).name.text === 'selector' && isSimpleTemplateString(prop.initializer)) {
        metadata.selector = (<any>prop).initializer.text;
      }
    });
    return metadata;
  }

  readComponentTemplateMetadata(dec: ts.Decorator, external: MetadataUrls) {
    const inlineTemplate = getDecoratorPropertyInitializer(dec, 'template');
    if (inlineTemplate && isSimpleTemplateString(inlineTemplate)) {
      const transformed = normalizeTransformed(Config.transformTemplate(inlineTemplate.text, null, dec));
      return {
        template: transformed,
        url: null,
        node: inlineTemplate
      };
    } else {
      if (external.templateUrl) {
        try {
          const template = this._fileResolver.resolve(external.templateUrl);
          const transformed = normalizeTransformed(Config.transformTemplate(template, external.templateUrl, dec));
          return {
            template: transformed,
            url: external.templateUrl,
            node: null
          };
        } catch (e) {
          logger.info('Cannot read the external template ' + external.templateUrl);
        }
      }
    }
  }

  readComponentStylesMetadata(dec: ts.Decorator, external: MetadataUrls) {
    const inlineStyles = getDecoratorPropertyInitializer(dec, 'styles');
    let styles: any[];
    if (inlineStyles && inlineStyles.kind === kinds.ArrayLiteralExpression) {
      inlineStyles.elements.forEach((inlineStyle: any) => {
        if (isSimpleTemplateString(inlineStyle)) {
          styles = styles || [];
          styles.push({
            style: normalizeTransformed(Config.transformStyle(inlineStyle.text, null, dec)),
            url: null,
            node: inlineStyle,
          });
        }
      });
    } else if (external.styleUrls) {
      try {
        styles = <any>external.styleUrls.map((url: string) => {
          const style = this._fileResolver.resolve(url);
          const transformed = normalizeTransformed(Config.transformStyle(style, url, dec));
          return {
            style: transformed, url,
            node: null
          };
        });
      } catch (e) {
        logger.info('Unable to read external style. ' + e.toString());
      }
    }
    return styles;
  }

  readComponentMetadata(d: ts.ClassDeclaration, dec: ts.Decorator) {
    const expr = this.getDecoratorArgument(dec);
    const metadata = this.readDirectiveMetadata(d, dec);
    const result = new ComponentMetadata();
    result.selector = metadata.selector;
    result.controller = metadata.controller;
    if (!expr) {
      return result;
    }
    const external = this._urlResolver.resolve(dec);
    result.template = this.readComponentTemplateMetadata(dec, external);
    result.styles = this.readComponentStylesMetadata(dec, external);
    return result;
  }

  protected getDecoratorArgument(decorator: ts.Decorator): ts.ObjectLiteralExpression {
    const expr = <ts.CallExpression>decorator.expression;
    if (expr && expr.arguments && expr.arguments.length) {
      const arg = <ts.ObjectLiteralExpression>expr.arguments[0];
      if (arg.kind === kinds.ObjectLiteralExpression && arg.properties) {
        return arg;
      }
    }
    return null;
  }
}
