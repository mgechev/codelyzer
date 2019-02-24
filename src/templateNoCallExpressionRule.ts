import { MethodCall } from '@angular/compiler';
import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { RecursiveAngularExpressionVisitor } from './angular/templates/recursiveAngularExpressionVisitor';

const ALLOWED_METHOD_NAMES: ReadonlySet<string> = new Set(['$any']);

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Disallows calling expressions in templates, except for output handlers.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Calling expressions in templates causes it to run on every change detection cycle and may cause performance issues.',
    ruleName: 'template-no-call-expression',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Avoid calling expressions in templates';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        expressionVisitorCtrl: ExpressionVisitor,
        templateVisitorCtrl: TemplateVisitor
      })
    );
  }
}

class TemplateVisitor extends BasicTemplateAstVisitor {
  visitEvent(): any {}
}

class ExpressionVisitor extends RecursiveAngularExpressionVisitor {
  visitMethodCall(ast: MethodCall, context: any): any {
    this.validateMethodCall(ast);
    super.visitMethodCall(ast, context);
  }

  private generateFailure(ast: MethodCall): void {
    const {
      span: { end: endSpan, start: startSpan }
    } = ast;

    this.addFailureFromStartToEnd(startSpan, endSpan, Rule.FAILURE_STRING);
  }

  private validateMethodCall(ast: MethodCall): void {
    const isMethodAllowed = ALLOWED_METHOD_NAMES.has(ast.name);

    if (isMethodAllowed) return;

    this.generateFailure(ast);
  }
}
