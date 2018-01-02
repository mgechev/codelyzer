import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import SyntaxKind = require('./util/syntaxKind');

const getInterfaceName = (t: any) => {
  if (t.expression && t.expression.name) {
    return t.expression.name.text;
  }
  return t.expression.text;
};

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'use-pipe-transform-interface',
    type: 'maintainability',
    description: 'Ensure that pipes implement PipeTransform interface.',
    rationale: 'Interfaces prescribe typed method signatures. Use those signatures to flag spelling and syntax mistakes.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
  };


  static FAILURE: string = 'The %s class has the Pipe decorator, so it should implement the PipeTransform interface';
  static PIPE_INTERFACE_NAME = 'PipeTransform';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new ClassMetadataWalker(sourceFile,
        this.getOptions()));
  }
}

export class ClassMetadataWalker extends Lint.RuleWalker {
  visitClassDeclaration(node: ts.ClassDeclaration) {
    let decorators = node.decorators;
    if (decorators) {
      let pipes: Array<string> = decorators.map(d =>
          (<any>d.expression).text ||
          ((<any>d.expression).expression || {}).text).filter(t => t === 'Pipe');
      if (pipes.length !== 0) {
        let className: string = node.name.text;
        if (!this.hasIPipeTransform(node)) {
          this.addFailure(
            this.createFailure(
              node.getStart(),
              node.getWidth(),
              sprintf.apply(this, [Rule.FAILURE, className])));
        }
      }
    }
    super.visitClassDeclaration(node);
  }

  private hasIPipeTransform(node: ts.ClassDeclaration): boolean {
    let interfaces = [];
    if (node.heritageClauses) {
      let interfacesClause = node.heritageClauses
        .filter(h => h.token === SyntaxKind.current().ImplementsKeyword);
      if (interfacesClause.length !== 0) {
        interfaces = interfacesClause[0].types.map(getInterfaceName);
      }
    }
    return interfaces.indexOf(Rule.PIPE_INTERFACE_NAME) !== -1;
  }
}
