import { AST, Binary, BindingPipe, LiteralPrimitive, PrefixNot } from '@angular/compiler';
import { IRuleMetadata, RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import { SourceFile } from 'typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { RecursiveAngularExpressionVisitor } from './angular/templates/recursiveAngularExpressionVisitor';

const unstrictEqualityOperator = '==';

const isAsyncBinding = (ast: AST): boolean => ast instanceof BindingPipe && ast.name === 'async';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that strict equality is used when evaluating negations on async pipe output.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: dedent`
      Angular's async pipes emit null initially, prior to the observable emitting any values, or the promise resolving. This can cause negations, like
      *ngIf="!(myConditional | async)" to thrash the layout and cause expensive side-effects like firing off XHR requests for a component which should not be shown.
    `,
    ruleName: 'template-no-negated-async',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING_NEGATED_PIPE =
    'Async pipes should not be negated. Use (observable | async) === (false | null | undefined) to check its value instead';
  static readonly FAILURE_STRING_UNSTRICT_EQUALITY = 'Async pipes must use strict equality `===` when comparing with `false`';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { expressionVisitorCtrl: ExpressionVisitorCtrl };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

class ExpressionVisitorCtrl extends RecursiveAngularExpressionVisitor {
  visitBinary(ast: Binary, context: any): any {
    this.validateBinary(ast);
    super.visitBinary(ast, context);
  }

  visitPrefixNot(ast: PrefixNot, context: any): any {
    this.validatePrefixNot(ast);
    super.visitPrefixNot(ast, context);
  }

  private generateFailure(
    ast: Binary | PrefixNot,
    errorMessage: typeof Rule.FAILURE_STRING_NEGATED_PIPE | typeof Rule.FAILURE_STRING_UNSTRICT_EQUALITY
  ): void {
    const {
      span: { end: spanEnd, start: spanStart },
    } = ast;

    this.addFailureFromStartToEnd(spanStart, spanEnd, errorMessage);
  }

  private validateBinary(ast: Binary): void {
    const { left, operation, right } = ast;

    if (!isAsyncBinding(left) || !(right instanceof LiteralPrimitive) || right.value !== false || operation !== unstrictEqualityOperator) {
      return;
    }

    this.generateFailure(ast, Rule.FAILURE_STRING_UNSTRICT_EQUALITY);
  }

  private validatePrefixNot(ast: PrefixNot): void {
    const { expression } = ast;

    if (!isAsyncBinding(expression)) return;

    this.generateFailure(ast, Rule.FAILURE_STRING_NEGATED_PIPE);
  }
}
