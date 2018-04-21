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
    typescriptOnly: true
  };

  static FAILURE_STRING: string = 'Avoid explicitly calls to lifecycle hooks in class "%s"';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
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
    const name = (node.expression as any).name;

    if (!name || !lifecycleHooksMethods.has(name.text)) {
      return;
    }

    let currentNode = node as any;

    while (currentNode.parent.parent) {
      currentNode = currentNode.parent;
    }

    const failureConfig = [Rule.FAILURE_STRING, currentNode.name.text];
    this.addFailureAtNode(node, sprintf.apply(this, failureConfig));
  }
}
