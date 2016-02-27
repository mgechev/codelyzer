import * as ts from 'typescript';
import 'reflect-metadata';
import {ComponentMetadata, DirectiveMetadata} from 'angular2/core';
import {SyntaxWalker} from './syntax_walker';

function getPropValue(p) {
  if (p.initializer.kind === ts.SyntaxKind.StringLiteral) {
    return p.initializer.text;
  }
  return null;
}

function getArrayLiteralValue(n) {
  if (n.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
    return n.initializer.elements.map(e => e.text);
  }
  return null;
}


function getObjectLiteralValue(n) {
  if (n.initializer.kind === ts.SyntaxKind.ObjectLiteralExpression) {
    return n.initializer.properties.reduce((p, c) => {
      p[c.name.text] = c.initializer.text;
      return p;
    }, {});
  }
  return null;
}

const PROP_MAP = {
  outputs: '_events',
  events: '_events',
  inputs: '_properties',
  properties: '_properties',
  host: 'host',
  selector: 'selector'
};

const classMetadataValueExtracter = {
  selector: getPropValue,
  inputs: getArrayLiteralValue,
  outputs: getArrayLiteralValue,
  host: getObjectLiteralValue
};

export class CollectMetadataWalker extends SyntaxWalker {
  metadata: DirectiveMetadata;
  visitPropertyDeclaration(node: ts.PropertyDeclaration) {
    let res = this.extractDecorators(node, /^HostBinding/);
    this.collectHostBindingMetadata(res.node, res.args[0]);
    super.visitPropertyDeclaration(node);
  }
  visitMethodDeclaration(node: ts.MethodDeclaration) {
    let res = this.extractDecorators(node, /^HostListener$/);
    this.collectHostListenerMetadata(res.node, res.args);
    super.visitMethodDeclaration(node);
  }
  visitClassDeclaration(node: ts.ClassDeclaration) {
    let res = this.extractDecorators(node, /^(Component|Directive)$/);
    this.collectClassDecoratorMetadata(res.node, res.name, res.args[0]);
    super.visitClassDeclaration(node);
  }
  extractDecorators(node: any, decoratorRegexp) {
    return (node.decorators || []).map(d => {
      let baseExpr = <any>d.expression || {};
      let expr = baseExpr.expression || {};
      let name = expr.text;
      let args = baseExpr.arguments || [];
      if (decoratorRegexp.test(name)) {
        return {
          args, name, node
        };
      }
      return null;
    }).find(r => !!r);
  }
  collectClassDecoratorMetadata(node, decoratorName, decoratorArg) {
    if (decoratorName === 'Directive') {
      this.metadata = new DirectiveMetadata();
    } else {
      this.metadata = new ComponentMetadata();
    }
    if (decoratorArg.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      decoratorArg.properties.forEach(prop => {
        let name = prop.name.text;
        let extracter = classMetadataValueExtracter[name];
        if (extracter && PROP_MAP[name]) {
          this.metadata[PROP_MAP[name]] = extracter(prop);
        } else {
          console.log(`Cannot extract value for ${name}`);
        }
      });
    }
  }
  collectHostBindingMetadata(node, decoratorArg) {
    let propName = node.name.text;
    if (!decoratorArg || decoratorArg.kind === ts.SyntaxKind.StringLiteral) {
      this.metadata.host = this.metadata.host || {};
      this.metadata.host[`[${(decoratorArg && decoratorArg.text) || propName}]`] = propName;
    } else {
      console.log('Unsupported construct');
    }
  }
  collectHostListenerMetadata(node, decoratorArgs) {
    let methodName = node.name.text;
    if (decoratorArgs[0].kind === ts.SyntaxKind.StringLiteral) {
      this.metadata.host = this.metadata.host || {};
      this.metadata.host[`(${decoratorArgs[0].text})`] = `${methodName}()`;
    }
  }
}
