import { BoundDirectivePropertyAst } from '@angular/compiler';
import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description:
      "Checks cyclomatic complexity against a specified limit. It is a quantitative measure of the number of linearly independent paths through a program's source code",
    optionExamples: [true, [true, 6]],
    options: {
      items: {
        type: 'string',
      },
      maxLength: 1,
      minLength: 0,
      type: 'array',
    },
    optionsDescription: 'Determine the maximum number of the cyclomatic complexity.',
    rationale: 'Cyclomatic complexity over some threshold indicates that the logic should be moved outside the template.',
    ruleName: 'template-cyclomatic-complexity',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = "The cyclomatic complexity exceeded the defined limit (cost '%s'). Your template should be refactored.";
  static readonly DEFAULT_MAX_COMPLEXITY = 5;

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { templateVisitorCtrl: TemplateVisitorCtrl };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }

  isEnabled(): boolean {
    const {
      metadata: {
        options: { maxLength, minLength },
      },
    } = Rule;
    const { length, [0]: maxComplexity } = this.ruleArguments;

    return super.isEnabled() && length >= minLength && length <= maxLength && (maxComplexity === undefined || maxComplexity > 0);
  }
}

export const getFailureMessage = (maxComplexity = Rule.DEFAULT_MAX_COMPLEXITY): string => {
  return sprintf(Rule.FAILURE_STRING, maxComplexity);
};

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  totalComplexity = 0;

  visitDirectiveProperty(prop: BoundDirectivePropertyAst, context: any): any {
    this.validateDirective(prop);
    super.visitDirectiveProperty(prop, context);
  }

  private validateDirective(prop: BoundDirectivePropertyAst): void {
    const pattern = /^ng(ForOf|If|Switch(Case|Default))$/;
    const { templateName } = prop;

    if (pattern.test(templateName)) {
      this.totalComplexity++;
    }

    const maxComplexity: number = this.getOptions()[0] || Rule.DEFAULT_MAX_COMPLEXITY;

    if (this.totalComplexity <= maxComplexity) {
      return;
    }

    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset },
      },
    } = prop;
    this.addFailureFromStartToEnd(startOffset, endOffset, getFailureMessage(maxComplexity));
  }
}
