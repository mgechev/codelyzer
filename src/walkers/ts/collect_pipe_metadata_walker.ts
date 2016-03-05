import {PipeMetadata} from 'angular2/core';
import * as ts from 'typescript';
import {BaseCollectMetadataWalker, PROP_MAP, classMetadataValueExtracter} from './base_collect_metadata_walker';

export class PipeInfo {
  metadata: PipeMetadata;
  classDeclaration: ts.ClassDeclaration;
}

export class CollectPipeMetadataWalker extends BaseCollectMetadataWalker<PipeInfo> {
  pipes: PipeInfo[] = [];
  private currentPipe: PipeInfo;
  private pipeNames: string[];
  private file;
  getMetadata(file, pipeNames?: string[]): PipeInfo[] {
    this.pipeNames = pipeNames;
    this.file = file;
    this.walk(file);
    return this.pipes;
  }
  protected visitClassDeclaration(node: ts.ClassDeclaration) {
    if (!this.pipeNames || this.pipeNames.indexOf(node.name.text) >= 0) {
      this.currentPipe = new PipeInfo();
      this.currentPipe.classDeclaration = node;
      // TODO: need to verify from where the Pipe is importend i.e. if that's an angular pipe or not
      let res = this.extractDecorators(node, /^Pipe$/);
      this.collectClassDecoratorMetadata(res.node, res.name, res.args[0]);
      super.visitClassDeclaration(node);
      this.pipes.push(this.currentPipe);
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
    let metadata:{name: string} = { name: null };
    if (decoratorArg.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      decoratorArg.properties.forEach(prop => {
        let name = prop.name.text;
        let extracter = classMetadataValueExtracter[name];
        if (extracter && PROP_MAP[name]) {
          metadata[PROP_MAP[name]] = extracter(prop);
        } else {
          console.log(`Cannot extract value for ${name}`);
        }
      });
    }
    this.currentPipe.metadata = new PipeMetadata(metadata);
  }
}
