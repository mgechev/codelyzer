import { AST, ASTWithSource, Binary, BoundDirectivePropertyAst, Lexer, Parser } from '@angular/compiler';
import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: "The condition complexity shouldn't exceed a rational limit in a template.",
    optionExamples: [true, [true, 4]],
    options: {
      items: {
        type: 'string',
      },
      maxLength: 1,
      minLength: 0,
      type: 'array',
    },
    optionsDescription: 'Determine the maximum number of Boolean operators allowed.',
    rationale: 'An important complexity complicates the tests and the maintenance.',
    ruleName: 'template-conditional-complexity',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static readonly DEFAULT_MAX_COMPLEXITY = 3;
  static readonly FAILURE_STRING =
    "The condition complexity (cost '%s') exceeded the defined limit (cost '%s'). The conditional expression should be moved into the component.";

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

export const getFailureMessage = (totalComplexity: number, maxComplexity = Rule.DEFAULT_MAX_COMPLEXITY): string => {
  return sprintf(Rule.FAILURE_STRING, totalComplexity, maxComplexity);
};

const getTotalComplexity = (ast: AST): number => {
  const expr = ((ast as ASTWithSource).source || '').replace(/\s/g, '');
  const expressionParser = new Parser(new Lexer());
  const astWithSource = expressionParser.parseAction(expr, null, 0);
  const conditions: Binary[] = [];
  let totalComplexity = 0;
  let condition = astWithSource.ast as Binary;

  if (condition.operation) {
    totalComplexity++;
    conditions.push(condition);
  }

  while (conditions.length > 0) {
    condition = conditions.pop()!;

    if (!condition.operation) {
      continue;
    }

    if (condition.left instanceof Binary) {
      totalComplexity++;
      conditions.push(condition.left);
    }

    if (condition.right instanceof Binary) {
      conditions.push(condition.right);
    }
  }

  return totalComplexity;
};

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  visitDirectiveProperty(prop: BoundDirectivePropertyAst, context: BasicTemplateAstVisitor): any {
    this.validateDirective(prop);
    super.visitDirectiveProperty(prop, context);
  }

  private validateDirective(prop: BoundDirectivePropertyAst): void {
    const { templateName, value } = prop;

    if (templateName !== 'ngIf') {
      return;
    }

    const maxComplexity: number = this.getOptions()[0] || Rule.DEFAULT_MAX_COMPLEXITY;
    const totalComplexity = getTotalComplexity(value);

    if (totalComplexity <= maxComplexity) {
      return;
    }

    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset },
      },
    } = prop;
    this.addFailureFromStartToEnd(startOffset, endOffset, getFailureMessage(totalComplexity, maxComplexity));
  }
}
