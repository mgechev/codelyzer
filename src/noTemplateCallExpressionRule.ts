import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor  } from './angular/templates/basicTemplateAstVisitor';
import { RecursiveAngularExpressionVisitor  } from './angular/templates/recursiveAngularExpressionVisitor';
import * as e from '@angular/compiler/src/expression_parser/ast';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'no-template-call-expression',
    type: 'functionality',
    description: 'Call expressions are not allowed in templates except in output handlers.',
    rationale: 'The change detector will call functions used in templates very often. Use an observable instead.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
  };

  static FAILURE_STRING = 'Call expressions are not allowed in templates except in output handlers.';

  apply(sourceFile: ts.SourceFile) {
    const walkerConfig: NgWalkerConfig = {
      templateVisitorCtrl: TemplateVisitor,
      expressionVisitorCtrl: ExpressionVisitor
    };

    return this.applyWithWalker(new NgWalker(sourceFile, this.getOptions(), walkerConfig));
  }
}

class TemplateVisitor extends BasicTemplateAstVisitor {
  // tslint:disable-next-line:no-missing-super no-empty
  visitEvent() { }
}

class ExpressionVisitor extends RecursiveAngularExpressionVisitor {
  visitFunctionCall(node: e.FunctionCall, context: any) {
    this.addFailureAt(node.span.start, node.span.end - node.span.start, Rule.FAILURE_STRING);

    super.visitFunctionCall(node, context);
  }

  visitMethodCall(node: e.MethodCall, context: any) {
    this.addFailureAt(node.span.start, node.span.end - node.span.start, Rule.FAILURE_STRING);

    super.visitMethodCall(node, context);
  }
}
