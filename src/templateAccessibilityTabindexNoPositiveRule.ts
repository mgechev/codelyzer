import { ElementAst } from '@angular/compiler';
import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { getAttributeValue } from './util/getAttributeValue';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that the tabindex attribute is not positive',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'positive values for tabindex attribute should be avoided because they mess up with the order of focus (AX_FOCUS_03)',
    ruleName: 'template-accessibility-tabindex-no-positive',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_MESSAGE = 'tabindex attribute cannot be positive';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { templateVisitorCtrl: TemplateVisitorCtrl };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  visitElement(ast: ElementAst, context: any): any {
    this.validateElement(ast);
    super.visitElement(ast, context);
  }

  private validateElement(element: ElementAst) {
    let tabIndexValue = getAttributeValue(element, 'tabindex');
    if (tabIndexValue) {
      tabIndexValue = parseInt(tabIndexValue, 10);
      if (tabIndexValue > 0) {
        const {
          sourceSpan: {
            end: { offset: endOffset },
            start: { offset: startOffset },
          },
        } = element;
        this.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_MESSAGE);
      }
    }
  }
}
