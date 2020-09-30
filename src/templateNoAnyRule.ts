import { MethodCall, PropertyRead } from '@angular/compiler';
import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import { SourceFile } from 'typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { RecursiveAngularExpressionVisitor } from './angular/templates/recursiveAngularExpressionVisitor';

const ANY_TYPE_CAST_FUNCTION_NAME = '$any';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: `Disallows using '${ANY_TYPE_CAST_FUNCTION_NAME}' in templates.`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: dedent`
      The use of '${ANY_TYPE_CAST_FUNCTION_NAME}' nullifies the compile-time
      benefits of the Angular's type system.
    `,
    ruleName: 'template-no-any',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = `Avoid using '${ANY_TYPE_CAST_FUNCTION_NAME}' in templates`;

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { expressionVisitorCtrl: ExpressionVisitorCtrl };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

class ExpressionVisitorCtrl extends RecursiveAngularExpressionVisitor {
  visitMethodCall(ast: MethodCall, context: any): any {
    this.validateMethodCall(ast);
    super.visitMethodCall(ast, context);
  }

  private generateFailure(ast: MethodCall): void {
    const {
      span: { end: endSpan, start: startSpan },
    } = ast;

    this.addFailureFromStartToEnd(startSpan, endSpan, Rule.FAILURE_STRING);
  }

  private validateMethodCall(ast: MethodCall): void {
    const isAnyTypeCastFunction = ast.name === ANY_TYPE_CAST_FUNCTION_NAME;
    const isAngularAnyTypeCastFunction = !(ast.receiver instanceof PropertyRead);

    if (!isAnyTypeCastFunction || !isAngularAnyTypeCastFunction) return;

    this.generateFailure(ast);
  }
}
