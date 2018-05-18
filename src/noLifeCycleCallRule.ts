import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Disallows explicit calls to life cycle hooks.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Explicit calls to life cycle hooks could be confusing. Invoke life cycle hooks is the responsability of Angular.',
    ruleName: 'no-life-cycle-call',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Avoid explicit calls to life cycle hooks.';

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ExpressionCallMetadataWalker(sourceFile, this.getOptions()));
  }
}

export type LifecycleHooksMethods =
  | 'ngAfterContentChecked'
  | 'ngAfterContentInit'
  | 'ngAfterViewChecked'
  | 'ngAfterViewInit'
  | 'ngDoCheck'
  | 'ngOnChanges'
  | 'ngOnDestroy'
  | 'ngOnInit';

export const lifecycleHooksMethods = new Set<LifecycleHooksMethods>([
  'ngAfterContentChecked',
  'ngAfterContentInit',
  'ngAfterViewChecked',
  'ngAfterViewInit',
  'ngDoCheck',
  'ngOnChanges',
  'ngOnDestroy',
  'ngOnInit'
]);

export class ExpressionCallMetadataWalker extends NgWalker {
  visitCallExpression(node: ts.CallExpression): void {
    this.validateCallExpression(node);
    super.visitCallExpression(node);
  }

  private validateCallExpression(node: ts.CallExpression): void {
    const name = ts.isPropertyAccessExpression(node.expression) ? node.expression.name : undefined;
    const expression = ts.isPropertyAccessExpression(node.expression) ? node.expression.expression : undefined;

    const isSuperCall = expression && expression.kind === ts.SyntaxKind.SuperKeyword;
    const isLifecycleCall = name && ts.isIdentifier(name) && lifecycleHooksMethods.has(name.text as LifecycleHooksMethods);

    if (isLifecycleCall && !isSuperCall) {
      this.addFailureAtNode(node, Rule.FAILURE_STRING);
    }
  }
}
