import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { CallExpression, isPropertyAccessExpression, SourceFile, SyntaxKind } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { isAngularLifecycleMethod } from './util/utils';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Disallows explicit calls to lifecycle methods.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: "Explicit calls to lifecycle methods could be confusing. Invoke them is an Angular's responsability.",
    ruleName: 'no-lifecycle-call',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'Avoid explicit calls to lifecycle methods';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  visitCallExpression(node: CallExpression): void {
    this.validateCallExpression(node);
    super.visitCallExpression(node);
  }

  private validateCallExpression(node: CallExpression): void {
    const { expression: nodeExpression } = node;

    if (!isPropertyAccessExpression(nodeExpression)) return;

    const {
      expression,
      name: { text: methodName },
    } = nodeExpression;
    const isLifecycleCall = isAngularLifecycleMethod(methodName);
    const isSuperCall = expression.kind === SyntaxKind.SuperKeyword;

    if (!isLifecycleCall || isSuperCall) return;

    this.addFailureAtNode(node, Rule.FAILURE_STRING);
  }
}
