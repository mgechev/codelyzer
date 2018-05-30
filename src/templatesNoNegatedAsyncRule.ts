import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { RecursiveAngularExpressionVisitor } from './angular/templates/recursiveAngularExpressionVisitor';
import * as e from '@angular/compiler/src/expression_parser/ast';
import * as ast from '@angular/compiler';

const unstrictEqualityOperator = '==';

class TemplateToNgTemplateVisitor extends RecursiveAngularExpressionVisitor {
  visitBinary(expr: e.Binary, context: any): any {
    if (!this.isAsyncBinding(expr.left)) {
      return super.visitBinary(expr, context);
    }
    if (!(expr.right instanceof ast.LiteralPrimitive) || expr.right.value !== false || expr.operation !== unstrictEqualityOperator) {
      return super.visitBinary(expr, context);
    }

    const {
      left: {
        span: { end: endLeftSpan }
      },
      right: {
        span: { start: startRightSpan }
      },
      span: { end: spanEnd, start: spanStart }
    } = expr;
    const operator = this.codeWithMap.code.slice(endLeftSpan, startRightSpan);
    const operatorStart = /^.*==/.exec(operator)![0].length - unstrictEqualityOperator.length;

    this.addFailureFromStartToEnd(spanStart, spanEnd, 'Async pipes must use strict equality `===` when comparing with `false`', [
      new Lint.Replacement(this.getSourcePosition(endLeftSpan) + operatorStart, unstrictEqualityOperator.length, '===')
    ]);
    super.visitBinary(expr, context);
  }

  visitPrefixNot(expr: e.PrefixNot, context: any): any {
    if (!this.isAsyncBinding(expr.expression)) {
      return super.visitPrefixNot(expr, context);
    }
    const {
      span: { end: spanEnd, start: spanStart }
    } = expr;
    const absoluteStart = this.getSourcePosition(spanStart);

    // Angular includes the whitespace after an expression, we want to trim that
    const expressionSource = this.codeWithMap.code.slice(spanStart, spanEnd);
    const concreteWidth = spanEnd - spanStart - / *$/.exec(expressionSource)![0].length;

    this.addFailureFromStartToEnd(spanStart, spanEnd, 'Async pipes can not be negated, use (observable | async) === false instead', [
      new Lint.Replacement(absoluteStart + concreteWidth, 1, ' === false '),
      new Lint.Replacement(absoluteStart, 1, '')
    ]);
  }

  protected isAsyncBinding(expr: any) {
    return expr instanceof ast.BindingPipe && expr.name === 'async';
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'templates-no-negated-async',
    type: 'functionality',
    description: 'Ensures that strict equality is used when evaluating negations on async pipe output.',
    rationale:
      'Async pipe evaluate to `null` before the observable or promise emits, which can lead to layout thrashing as' +
      ' components load. Prefer strict `=== false` checks instead.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
    hasFix: true
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        expressionVisitorCtrl: TemplateToNgTemplateVisitor
      })
    );
  }
}
