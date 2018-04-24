import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'no-life-cycle-call',
    type: 'maintainability',
    description: 'Disallows explicit calls to lifecycle hooks.',
    rationale: 'Explicit calls to lifecycle hooks could be confusing. Invoke lifecycle hooks is the responsability of Angular.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
  };

  static FAILURE_STRING: string = 'Avoid explicit calls to lifecycle hooks.';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ExpressionCallMetadataWalker(sourceFile, this.getOptions()));
  }
}

export type LifecycleHooksMethods =
  'ngAfterContentChecked' |
  'ngAfterContentInit' |
  'ngAfterViewChecked' |
  'ngAfterViewInit' |
  'ngDoCheck' |
  'ngOnChanges' |
  'ngOnDestroy' |
  'ngOnInit';

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
    const isLifecycleCall = name && ts.isIdentifier(name) && lifecycleHooksMethods.has(name.text as any);

    if (isLifecycleCall && !isSuperCall) {
      this.addFailureAtNode(node, Rule.FAILURE_STRING);
    }
  }
}
