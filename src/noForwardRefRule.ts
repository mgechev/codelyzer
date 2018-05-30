import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, Rules, RuleWalker } from 'tslint/lib';
import { CallExpression, SourceFile, SyntaxKind } from 'typescript/lib/typescript';

export class Rule extends Rules.AbstractRule {
  static metadata: IRuleMetadata = {
    description: 'Disallows usage of forward references for DI.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'The flow of DI is disrupted by using `forwardRef` and might make code more difficult to understand.',
    ruleName: 'no-forward-ref',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING_CLASS = 'Avoid using forwardRef in class "%s"';
  static readonly FAILURE_STRING_VARIABLE = 'Avoid using forwardRef in variable "%s"';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new ExpressionCallMetadataWalker(sourceFile, this.getOptions()));
  }
}

export class ExpressionCallMetadataWalker extends RuleWalker {
  visitCallExpression(node: CallExpression) {
    this.validateCallExpression(node);
    super.visitCallExpression(node);
  }

  private validateCallExpression(callExpression) {
    if (callExpression.expression.text === 'forwardRef') {
      let currentNode = callExpression;

      while (currentNode.parent.parent) {
        currentNode = currentNode.parent;
      }

      const failure =
        currentNode.kind === SyntaxKind.VariableStatement
          ? sprintf(Rule.FAILURE_STRING_VARIABLE, currentNode.declarationList.declarations[0].name.text)
          : sprintf(Rule.FAILURE_STRING_CLASS, currentNode.name.text);

      this.addFailureAtNode(callExpression, failure);
    }
  }
}
