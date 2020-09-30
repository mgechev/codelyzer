import { ElementAst } from '@angular/compiler';
import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { SourceFile } from 'typescript';
import { BasicTemplateAstVisitor } from './angular';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  visitElement(ast: ElementAst, context: any) {
    this.validateElement(ast);
    super.visitElement(ast, context);
  }

  validateElement(element: ElementAst) {
    if (Rule.ELEMENTS.indexOf(element.name) === -1) {
      return;
    }

    const hasContent = element.children.length;
    const hasInnerContent = element.inputs.some((input) => input.name === 'innerHTML' || input.name === 'innerText');
    if (hasContent || hasInnerContent) {
      return;
    }
    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset },
      },
    } = element;
    this.addFailureFromStartToEnd(startOffset, endOffset, getErrorMessage(element.name));
  }
}

export const getErrorMessage = (element: string): string => {
  return sprintf(Rule.FAILURE_STRING, element);
};

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that the heading, anchor and button elements have content in it',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Heading, anchor and button elements should have content to be accessible by screen readers',
    ruleName: 'template-accessibility-elements-content',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = '<%s/> element should have content';
  static readonly ELEMENTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button'];

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { templateVisitorCtrl: TemplateVisitorCtrl };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}
