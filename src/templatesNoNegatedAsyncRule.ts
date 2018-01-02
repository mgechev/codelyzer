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

    const operator = this.codeWithMap.code.slice(expr.left.span.end, expr.right.span.start);
    const operatorStart = (/^.*==/).exec(operator)[0].length - unstrictEqualityOperator.length;

    this.addFailure(this.createFailure(
      expr.span.start,
      expr.span.end - expr.span.start,
      'Async pipes must use strict equality `===` when comparing with `false`',
      [
        new Lint.Replacement(
          this.getSourcePosition(expr.left.span.end) + operatorStart,
          unstrictEqualityOperator.length,
          '===',
        ),
      ]
    ));
  }

  visitPrefixNot(expr: e.PrefixNot, context: any): any {
    if (!this.isAsyncBinding(expr.expression)) {
      return super.visitPrefixNot(expr, context);
    }

    const width = expr.span.end - expr.span.start;
    const absoluteStart = this.getSourcePosition(expr.span.start);

    // Angular includes the whitespace after an expression, we want to trim that
    const expressionSource = this.codeWithMap.code.slice(expr.span.start, expr.span.end);
    const concreteWidth = width - (/ *$/).exec(expressionSource)[0].length;

    this.addFailure(this.createFailure(
      expr.span.start,
      width,
      'Async pipes can not be negated, use (observable | async) === false instead',
      [
        new Lint.Replacement(absoluteStart + concreteWidth, 1, ' === false '),
        new Lint.Replacement(absoluteStart, 1, ''),
      ],
    ));
  }

  protected isAsyncBinding(expr: any) {
    return expr instanceof ast.BindingPipe && expr.name === 'async';
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'templates-no-negated-async',
    type: 'functionality',
    description: 'Ensures that strict equality is used when evaluating negations on async pipe outout.',
    rationale: 'Async pipe evaluate to `null` before the observable or promise emits, which can lead to layout thrashing as' +
      ' components load. Prefer strict `=== false` checks instead.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
    hasFix: true
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new NgWalker(sourceFile,
            this.getOptions(), {
              expressionVisitorCtrl: TemplateToNgTemplateVisitor
            }));
  }
}
