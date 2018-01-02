import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import SyntaxKind = require('./util/syntaxKind');

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'no-forward-ref',
    type: 'maintainability',
    description: 'Disallows usage of forward references for DI.',
    rationale: 'The flow of DI is disrupted by using `forwardRef` and might make code more difficult to understand.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
  };


  static FAILURE_IN_CLASS: string = 'Avoid using forwardRef in class "%s"';

  static FAILURE_IN_VARIABLE: string = 'Avoid using forwardRef in variable "%s"';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new ExpressionCallMetadataWalker(sourceFile,
        this.getOptions()));
  }
}

export class ExpressionCallMetadataWalker extends Lint.RuleWalker {
  visitCallExpression(node: ts.CallExpression) {
    this.validateCallExpression(node);
    super.visitCallExpression(node);
  }

  private validateCallExpression(callExpression) {
    if (callExpression.expression.text === 'forwardRef') {
      let currentNode: any = callExpression;
      while (currentNode.parent.parent) {
        currentNode = currentNode.parent;
      }
      let failureConfig: string[] = [];
      if (currentNode.kind === SyntaxKind.current().VariableStatement) {
        failureConfig = [Rule.FAILURE_IN_VARIABLE, currentNode.declarationList.declarations[0].name.text];
      } else {
        failureConfig = [Rule.FAILURE_IN_CLASS, currentNode.name.text];
      }
      this.addFailure(
        this.createFailure(
          callExpression.getStart(),
          callExpression.getWidth(),
          sprintf.apply(this, failureConfig)));
    }
  }
}
