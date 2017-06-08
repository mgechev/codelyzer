import * as Lint from 'tslint';
import * as ts from 'typescript';
import {NgWalker} from './angular/ngWalker';
import {RecursiveAngularExpressionVisitor} from './angular/templates/recursiveAngularExpressionVisitor';
import * as e from '@angular/compiler/src/expression_parser/ast';
import * as ast from '@angular/compiler';

class TemplateToNgTemplateVisitor extends RecursiveAngularExpressionVisitor {
  visitBinary(expr: e.Binary, context: any): any {
    if (!this.isAsyncBinding(expr.left)) {
      return super.visitBinary(expr, context);
    }
    if (!(expr.right instanceof ast.LiteralPrimitive) || expr.right.value !== false || expr.operation !== '==') {
      return super.visitBinary(expr, context);
    }

    this.addFailure(this.createFailure(
      expr.span.start,
      expr.span.end - expr.span.start,
      `Async pipes must use strict equality \`===\` when comparing with \`false\``,
    ));
  }

  visitPrefixNot(expr: e.PrefixNot, context: any): any {
    if (this.isAsyncBinding(expr.expression)) {
      this.addFailure(this.createFailure(
        expr.span.start,
        expr.span.end - expr.span.start,
        `Async pipes can not be negated, use (observable | async) === false instead`,
      ));
    } else {
      super.visitPrefixNot(expr, context);
    }
  }

  protected isAsyncBinding(expr: any) {
    return expr instanceof ast.BindingPipe && expr.name === 'async';
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'templates-no-negated-async-rule',
    type: 'functionality',
    description: `Ensures that strict equality is used when evaluating negations on async pipe outout.`,
    rationale: `Async pipe evaluate to \`null\` before the observable or promise emits, which can lead to layout thrashing as components load. Prefer strict \`=== false\` checks instead.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new NgWalker(sourceFile,
            this.getOptions(), {
              expressionVisitorCtrl: TemplateToNgTemplateVisitor
            }));
  }
}
