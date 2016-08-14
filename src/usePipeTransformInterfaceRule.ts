import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import SyntaxKind = require('./util/syntaxKind');

export class Rule extends Lint.Rules.AbstractRule {

  public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
    return this.applyWithWalker(
      new ClassMetadataWalker(sourceFile,
        this.getOptions()));
  }

  static FAILURE: string = 'The %s class has the Pipe decorator, so it should implement the PipeTransform interface';
  static PIPE_INTERFACE_NAME = 'PipeTransform';
}

export class ClassMetadataWalker extends Lint.RuleWalker {

  visitClassDeclaration(node:ts.ClassDeclaration) {
    let decorators = node.decorators;
    if (decorators) {
      let pipes:Array<string> = decorators.map(d =>
          (<any>d.expression).text ||
          ((<any>d.expression).expression || {}).text).filter(t=> t === 'Pipe');
      if (pipes.length !== 0) {
        let className:string = node.name.text;
        if(!this.hasIPipeTransform(node)){
          this.addFailure(
            this.createFailure(
              node.getStart(),
              node.getWidth(),
              sprintf.apply(this, [Rule.FAILURE,className])));
        }
      }
    }
    super.visitClassDeclaration(node);
  }

  private hasIPipeTransform(node:ts.ClassDeclaration):boolean{
    let interfaces = [];
    if (node.heritageClauses) {
      let interfacesClause = node.heritageClauses
        .filter(h=>h.token === SyntaxKind.current().ImplementsKeyword);
      if (interfacesClause.length !== 0) {
        interfaces = interfacesClause[0].types.map(t=>(<any>t.expression).text);
      }
    }
    return interfaces.indexOf(Rule.PIPE_INTERFACE_NAME)!==-1;
  }
}
