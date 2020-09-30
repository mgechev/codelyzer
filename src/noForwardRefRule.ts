import { IRuleMetadata, RuleFailure, WalkContext } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { CallExpression, forEachChild, isCallExpression, Node, SourceFile } from 'typescript/lib/typescript';

export const FORWARD_REF = 'forwardRef';

export class Rule extends AbstractRule {
  static metadata: IRuleMetadata = {
    description: `Disallows usage of \`${FORWARD_REF}\` references for DI.`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: `The flow of DI is disrupted by using \`${FORWARD_REF}\` and might make code more difficult to understand.`,
    ruleName: 'no-forward-ref',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = `Avoid using \`${FORWARD_REF}\``;

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

const validateCallExpression = (context: WalkContext, node: CallExpression): void => {
  if (node.expression.getText() !== FORWARD_REF) return;

  context.addFailureAtNode(node, Rule.FAILURE_STRING);
};

const walk = (context: WalkContext): void => {
  const { sourceFile } = context;

  const callback = (node: Node): void => {
    if (isCallExpression(node)) validateCallExpression(context, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
