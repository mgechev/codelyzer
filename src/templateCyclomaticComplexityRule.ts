import * as Lint from 'tslint';
import * as ts from 'typescript';
import * as ast from '@angular/compiler';
import { sprintf } from 'sprintf-js';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'template-cyclomatic-complexity',
    type: 'functionality',
    // tslint:disable-next-line:max-line-length
    description: 'Checks cyclomatic complexity against a specified limit. It is a quantitative measure of the number of linearly independent paths through a program\'s source code',
    rationale: 'Cyclomatic complexity over some threshold indicates that the logic should be moved outside the template.',
    options: {
      type: 'array',
      items: {
        type: 'string'
      },
      minLength: 0,
      maxLength: 2,
    },
    optionExamples: [
      'true',
      '[true, 6]'
    ],
    optionsDescription: 'Determine the maximum number of the cyclomatic complexity.',
    typescriptOnly: true,
    hasFix: false
  };

  // tslint:disable-next-line:max-line-length
  static COMPLEXITY_FAILURE_STRING = 'The cyclomatic complexity exceeded the defined limit (cost \'%s\'). Your template should be refactored.';

  static COMPLEXITY_MAX = 5;

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

    return this.applyWithWalker(
      new NgWalker(sourceFile,
        this.getOptions(), {
          templateVisitorCtrl: TemplateConditionalComplexityVisitor,
        }));
  }
}

class TemplateConditionalComplexityVisitor extends BasicTemplateAstVisitor {

  complexity = 0;

  visitDirectiveProperty(prop: ast.BoundDirectivePropertyAst, context: BasicTemplateAstVisitor): any {
    if (prop.sourceSpan) {
      const directive = (<any>prop.sourceSpan).toString();

      if (directive.startsWith('*ngFor') || directive.startsWith('*ngIf') ||
          directive.startsWith('*ngSwitchCase') || directive.startsWith('*ngSwitchDefault')) {
        this.complexity++;
      }
    }

    const options = this.getOptions();
    const complexityMax: number = options.length ? options[0] : Rule.COMPLEXITY_MAX;

    if (this.complexity > complexityMax) {
      const span = prop.sourceSpan;
      let failureConfig: string[] = [String(complexityMax)];
      failureConfig.unshift(Rule.COMPLEXITY_FAILURE_STRING);
      this.addFailure(this.createFailure(span.start.offset, span.end.offset - span.start.offset,
          sprintf.apply(this, failureConfig))
      );
    }

    super.visitDirectiveProperty(prop, context);
  }
}
