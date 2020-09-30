import { AttrAst, BoundElementPropertyAst, ElementAst, TextAst } from '@angular/compiler';
import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Enforces alternate text for elements which require the alt, aria-label, aria-labelledby attributes',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Alternate text lets screen readers provide more information to end users.',
    ruleName: 'template-accessibility-alt-text',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = '%s element must have a text alternative.';
  static readonly DEFAULT_ELEMENTS = ['img', 'object', 'area', 'input[type="image"]'];

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { templateVisitorCtrl: TemplateVisitorCtrl };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

export const getFailureMessage = (name: string): string => {
  return sprintf(Rule.FAILURE_STRING, name);
};

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  visitElement(ast: ElementAst, context: any) {
    this.validateElement(ast);
    super.visitElement(ast, context);
  }

  validateElement(element: ElementAst) {
    const typesToValidate = Rule.DEFAULT_ELEMENTS.map((type) => {
      if (type === 'input[type="image"]') {
        return 'input';
      }
      return type;
    });
    if (typesToValidate.indexOf(element.name) === -1) {
      return;
    }

    const isValid = this[element.name](element);
    if (isValid) {
      return;
    }
    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset },
      },
    } = element;
    this.addFailureFromStartToEnd(startOffset, endOffset, getFailureMessage(element.name));
  }

  img(element: ElementAst) {
    const hasAltAttr = element.attrs.some((attr) => attr.name === 'alt');
    const hasAltInput = element.inputs.some((input) => input.name === 'alt');
    return hasAltAttr || hasAltInput;
  }

  object(element: ElementAst) {
    let elementHasText: string = '';
    const hasLabelAttr = element.attrs.some((attr) => attr.name === 'aria-label' || attr.name === 'aria-labelledby');
    const hasLabelInput = element.inputs.some((input) => input.name === 'aria-label' || input.name === 'aria-labelledby');
    const hasTitleAttr = element.attrs.some((attr) => attr.name === 'title');
    const hasTitleInput = element.inputs.some((input) => input.name === 'title');
    if (element.children.length) {
      elementHasText = (<TextAst>element.children[0]).value;
    }
    return hasLabelAttr || hasLabelInput || hasTitleAttr || hasTitleInput || elementHasText;
  }

  area(element: ElementAst) {
    const hasLabelAttr = element.attrs.some((attr) => attr.name === 'aria-label' || attr.name === 'aria-labelledby');
    const hasLabelInput = element.inputs.some((input) => input.name === 'aria-label' || input.name === 'aria-labelledby');
    const hasAltAttr = element.attrs.some((attr) => attr.name === 'alt');
    const hasAltInput = element.inputs.some((input) => input.name === 'alt');
    return hasAltAttr || hasAltInput || hasLabelAttr || hasLabelInput;
  }

  input(element: ElementAst) {
    const attrType: AttrAst = element.attrs.find((attr) => attr.name === 'type') || <AttrAst>{};
    const inputType: BoundElementPropertyAst = element.inputs.find((input) => input.name === 'type') || <BoundElementPropertyAst>{};
    const type = attrType.value || inputType.value;
    if (type !== 'image') {
      return true;
    }

    return this.area(element);
  }
}
