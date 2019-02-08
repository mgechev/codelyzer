import { ElementAst } from '@angular/compiler';
import { IRuleMetadata, RuleFailure, Rules, Utils } from 'tslint/lib';
import { SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular';

class TemplateAccessibilityAnchorContentVisitor extends BasicTemplateAstVisitor {
  visitElement(ast: ElementAst, context: any) {
    this.validateElement(ast);
    super.visitElement(ast, context);
  }

  validateElement(element: ElementAst) {
    if (element.name !== 'a') {
      return;
    }

    const hasContent = element.children.length;
    const hasInnerContent = element.inputs.some(input => input.name === 'innerHTML' || input.name === 'innerText');
    if (hasContent || hasInnerContent) {
      return;
    }
    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset }
      }
    } = element;
    this.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_MESSAGE);
  }
}

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that the anchor element has some content in it',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Anchor elements should have content to be accessible by screen readers',
    ruleName: 'template-accessibility-anchor-content',
    type: 'functionality',
    typescriptOnly: true
  };

  static readonly FAILURE_MESSAGE = 'Anchor element should have content';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: TemplateAccessibilityAnchorContentVisitor
      })
    );
  }
}
