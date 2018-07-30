import { AST, BindingPipe, LiteralPrimitive } from '@angular/compiler';
import { Binary, PrefixNot } from '@angular/compiler/src/expression_parser/ast';
import { IRuleMetadata, RuleFailure, Rules, Utils } from 'tslint/lib';
import { SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { RecursiveAngularExpressionVisitor } from './angular/templates/recursiveAngularExpressionVisitor';

const unstrictEqualityOperator = '==';

const isAsyncBinding = (ast: AST): boolean => {
  return ast instanceof BindingPipe && ast.name === 'async';
};

class TemplateToNgTemplateVisitor extends RecursiveAngularExpressionVisitor {
  visitBinary(ast: Binary, context: any): any {
    this.validateBinary(ast);
    super.visitBinary(ast, context);
  }

  visitPrefixNot(ast: PrefixNot, context: any): any {
    this.validatePrefixNot(ast);
    super.visitPrefixNot(ast, context);
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

    if (!isAsyncBinding(expression)) {
      return;
    }

    this.generateFailure(ast, Rule.FAILURE_STRING_NEGATED_PIPE);
  }

  private generateFailure(ast: Binary | PrefixNot, errorMessage: string): void {
    const {
      span: { end: spanEnd, start: spanStart }
    } = ast;

    this.addFailureFromStartToEnd(spanStart, spanEnd, errorMessage);
  }
}

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that strict equality is used when evaluating negations on async pipe output.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: Utils.dedent`
      Async pipe evaluate to \`null\` before the observable or promise emits, which can lead to layout thrashing as
      components load. Prefer strict \`=== false\` checks instead.
    `,
    ruleName: 'templates-no-negated-async',
    type: 'functionality',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING_NEGATED_PIPE = 'Async pipes can not be negated, use (observable | async) === false instead';
  static readonly FAILURE_STRING_UNSTRICT_EQUALITY = 'Async pipes must use strict equality `===` when comparing with `false`';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        expressionVisitorCtrl: TemplateToNgTemplateVisitor
      })
    );
  }
}
