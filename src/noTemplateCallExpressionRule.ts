import * as e from '@angular/compiler/src/expression_parser/ast';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { RecursiveAngularExpressionVisitor } from './angular/templates/recursiveAngularExpressionVisitor';

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Call expressions are not allowed in templates except in output handlers.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'The change detector will call functions used in templates very often. Use an observable instead.',
    ruleName: 'no-template-call-expression',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Call expressions are not allowed in templates except in output handlers';

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walkerConfig: NgWalkerConfig = {
      expressionVisitorCtrl: ExpressionVisitor,
      templateVisitorCtrl: TemplateVisitor
    };

    return this.applyWithWalker(new NgWalker(sourceFile, this.getOptions(), walkerConfig));
  }
}

class TemplateVisitor extends BasicTemplateAstVisitor {
  visitEvent() {}
}

class ExpressionVisitor extends RecursiveAngularExpressionVisitor {
  visitFunctionCall(node: e.FunctionCall, context: any) {
    this.addFailureFromStartToEnd(node.span.start, node.span.end, Rule.FAILURE_STRING);

    super.visitFunctionCall(node, context);
  }

  visitMethodCall(node: e.MethodCall, context: any) {
    this.addFailureFromStartToEnd(node.span.start, node.span.end, Rule.FAILURE_STRING);

    super.visitMethodCall(node, context);
  }
}
