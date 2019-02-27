import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, RuleWalker } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { CallExpression, isClassDeclaration, isVariableStatement, SourceFile } from 'typescript/lib/typescript';
import { getNextToLastParentNode } from './util/utils';

export const FORWARD_REF = 'forwardRef';

export class Rule extends AbstractRule {
  static metadata: IRuleMetadata = {
    description: `Disallows usage of \`${FORWARD_REF}\` references for DI.`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: `The flow of DI is disrupted by using \`${FORWARD_REF}\` and might make code more difficult to understand.`,
    ruleName: 'no-forward-ref',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING_CLASS = `Avoid using \`${FORWARD_REF}\` in a class`;
  static readonly FAILURE_STRING_VARIABLE = `Avoid using \`${FORWARD_REF}\` in variable "%s"`;

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new NoForwardRefWalker(sourceFile, this.getOptions()));
  }
}

export class NoForwardRefWalker extends RuleWalker {
  visitCallExpression(node: CallExpression): void {
    this.validateCallExpression(node);
    super.visitCallExpression(node);
  }

  private validateCallExpression(node: CallExpression): void {
    if (node.expression.getText() !== FORWARD_REF) return;

    const nextToLastParent = getNextToLastParentNode(node);
    let failure: ReturnType<typeof sprintf>;

    if (isVariableStatement(nextToLastParent)) {
      failure = Rule.FAILURE_STRING_VARIABLE;
    } else if (isClassDeclaration(nextToLastParent) && nextToLastParent.name) {
      failure = Rule.FAILURE_STRING_CLASS;
    } else {
      return;
    }

    this.addFailureAtNode(node, failure);
  }
}
