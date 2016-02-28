import * as ts from 'typescript';

import {BaseCollectMetadataWalker, PROP_MAP, classMetadataValueExtracter} from './base_collect_metadata_walker';
import {CollectPipeMetadataWalker} from './collect_pipe_metadata_walker';
import {ComponentMetadata, DirectiveMetadata} from 'angular2/core';

export class DirectiveInfo {
  metadata: DirectiveMetadata;
  classDeclaration: ts.ClassDeclaration;
}

export class CollectComponentMetadataWalker extends BaseCollectMetadataWalker<DirectiveInfo> {
  directives: DirectiveInfo[] = [];
  private currentDirective;
  private directivesName: string[];
  private file;
  getMetadata(file, directivesName?: string[]): DirectiveInfo[] {
    this.directivesName = directivesName;
    this.file = file;
    this.walk(file);
    return this.directives;
  }
  protected visitPropertyDeclaration(node: ts.PropertyDeclaration) {
    let res = this.extractDecorators(node, /^HostBinding/);
    this.collectHostBindingMetadata(res.node, res.args[0]);
    super.visitPropertyDeclaration(node);
  }
  protected visitMethodDeclaration(node: ts.MethodDeclaration) {
    let res = this.extractDecorators(node, /^HostListener$/);
    this.collectHostListenerMetadata(res.node, res.args);
    super.visitMethodDeclaration(node);
  }
  protected visitClassDeclaration(node: ts.ClassDeclaration) {
    if (!this.directivesName || this.directivesName.indexOf(node.name.text) >= 0) {
      this.currentDirective = new DirectiveInfo();
      this.currentDirective.classDeclaration = node;
      let res = this.extractDecorators(node, /^(Component|Directive)$/);
      this.collectClassDecoratorMetadata(res.node, res.name, res.args[0]);
      super.visitClassDeclaration(node);
      this.directives.push(this.currentDirective);
    }
  }
  private extractDecorators(node: any, decoratorRegexp) {
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
  private collectClassDecoratorMetadata(node, decoratorName, decoratorArg) {
    if (decoratorName === 'Directive') {
      this.currentDirective.metadata = new DirectiveMetadata();
    } else {
      this.currentDirective.metadata = new ComponentMetadata();
    }
    if (decoratorArg.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      decoratorArg.properties.forEach(prop => {
        let name = prop.name.text;
        if (name === 'directives') {
          this.currentDirective.metadata[name] =
            this.referenceExtractorStrategy.extract(prop.initializer.elements, this.file,
              extractor => new CollectComponentMetadataWalker(extractor));
        } else if (name ==='pipes') {
          this.currentDirective.metadata[name] =
            this.referenceExtractorStrategy.extract(prop.initializer.elements, this.file,
              extractor => new CollectPipeMetadataWalker(extractor));
        } else {
          let extracter = classMetadataValueExtracter[name];
          if (extracter && PROP_MAP[name]) {
            this.currentDirective.metadata[PROP_MAP[name]] = extracter(prop);
          } else {
            console.log(`Cannot extract value for ${name}`);
          }
        }
      });
    }
  }
  private collectHostBindingMetadata(node, decoratorArg) {
    let propName = node.name.text;
    if (!decoratorArg || decoratorArg.kind === ts.SyntaxKind.StringLiteral) {
      this.currentDirective.metadata.host = this.currentDirective.metadata.host || {};
      this.currentDirective.metadata.host[`[${(decoratorArg && decoratorArg.text) || propName}]`] = propName;
    } else {
      console.log('Unsupported construct');
    }
  }
  private collectHostListenerMetadata(node, decoratorArgs) {
    let methodName = node.name.text;
    if (decoratorArgs[0].kind === ts.SyntaxKind.StringLiteral) {
      this.currentDirective.metadata.host = this.currentDirective.metadata.host || {};
      this.currentDirective.metadata.host[`(${decoratorArgs[0].text})`] = `${methodName}()`;
    }
  }
}
