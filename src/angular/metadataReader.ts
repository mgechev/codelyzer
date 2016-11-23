import * as ts from 'typescript';
import {current} from '../util/syntaxKind';
import {isSimpleTemplateString, getDecoratorPropertyInitializer} from '../util/utils';

const kinds = current();

import {FileResolver} from './fileResolver/fileResolver';
import {AbstractResolver} from './urlResolvers/abstractResolver';
import {UrlResolver} from './urlResolvers/urlResolver';

import {DirectiveMetadata, ComponentMetadata, StylesMetadata} from './metadata';

export class MetadataReader {
  constructor(private _fileResolver: FileResolver, private _urlResolver?: AbstractResolver) {
    this._urlResolver  = this._urlResolver || new UrlResolver();
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
    expr.properties.forEach((p: ts.ObjectLiteralElementLike) => {
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

  readComponentMetadata(d: ts.ClassDeclaration, dec: ts.Decorator) {
    const expr = this.getDecoratorArgument(dec);
    const metadata = this.readDirectiveMetadata(d, dec);
    const result = new ComponentMetadata();
    if (!expr) {
      return result;
    }
    result.selector = metadata.selector;
    result.controller = metadata.controller;
    const inlineTemplate = getDecoratorPropertyInitializer(dec, 'template');
    const external = this._urlResolver.resolve(dec);
    if (inlineTemplate && isSimpleTemplateString(inlineTemplate)) {
      result.template = {
        template: inlineTemplate.text,
        source: null,
        node: inlineTemplate
      };
    }
    const inlineStyles = getDecoratorPropertyInitializer(dec, 'styles');
    if (inlineStyles && inlineStyles.kind === kinds.ArrayLiteralExpression) {
      inlineStyles.elements.forEach((inlineStyle: any) => {
        if (isSimpleTemplateString(inlineStyle)) {
          result.styles = result.styles || [];
          result.styles.push({
            style: inlineStyle.text,
            source: null,
            node: inlineStyle
          });
        }
      });
    }
    if (!result.template && external.templateUrl) {
      try {
        result.template = {
          template: this._fileResolver.resolve(external.templateUrl),
          source: external.templateUrl,
          node: null
        };
      } catch (e) {
        console.log(e);
        console.log('Cannot read the external template ' + external.templateUrl);
      }
    }
    if (!result.styles || !result.styles.length) {
      try {
        result.styles = <any>external.styleUrls.map((url: string) => {
          return {
            style: this._fileResolver.resolve(url),
            source: url,
            node: null
          };
        });
      } catch (e) {
        console.log('Unable to read external style. ' + e.toString());
      }
    }
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

