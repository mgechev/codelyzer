import { BoundDirectivePropertyAst, ElementAst } from '@angular/compiler';
import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, Rules, Utils } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { mayContainChildComponent } from './util/mayContainChildComponent';

interface ILabelForOptions {
  labelComponents: string[];
  labelAttributes: string[];
  controlComponents: string[];
}
export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Checks if the label has associated for attribute or a form element',
    optionExamples: [[true, { labelComponents: ['app-label'], labelAttributes: ['id'], controlComponents: ['app-input', 'app-select'] }]],
    options: {
      items: {
        type: 'object',
        properties: {
          labelComponents: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          labelAttributes: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          controlComponents: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      },
      type: 'array'
    },
    optionsDescription: 'Add custom label, label attribute and controls',
    rationale: Utils.dedent`
    The label tag should either have a for attribute or should have associated control.
    This rule supports two ways, either the label component should explicitly have a for attribute or a control nested inside the label component
    It also supports adding custom control component and custom label component support.`,
    ruleName: 'template-accessibility-label-for',
    type: 'functionality',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'A form label must be associated with a control';
  static readonly FORM_ELEMENTS = ['input', 'select', 'textarea'];

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: TemplateAccessibilityLabelForVisitor
      })
    );
  }
}

class TemplateAccessibilityLabelForVisitor extends BasicTemplateAstVisitor {
  visitElement(element: ElementAst, context: any) {
    this.validateElement(element);
    super.visitElement(element, context);
  }

  private validateElement(element: ElementAst) {
    let { labelAttributes, labelComponents, controlComponents }: ILabelForOptions = this.getOptions() || {};
    controlComponents = Rule.FORM_ELEMENTS.concat(controlComponents || []);
    labelComponents = ['label'].concat(labelComponents || []);
    labelAttributes = ['for'].concat(labelAttributes || []);

    if (labelComponents.indexOf(element.name) === -1) {
      return;
    }
    const hasForAttr = element.attrs.some(attr => labelAttributes.indexOf(attr.name) !== -1);
    const hasForInput = element.inputs.some(input => {
      return labelAttributes.indexOf(input.name) !== -1;
    });

    const hasImplicitFormElement = controlComponents.some(component => mayContainChildComponent(element, component));

    if (hasForAttr || hasForInput || hasImplicitFormElement) {
      return;
    }
    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset }
      }
    } = element;

    this.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_STRING);
  }
}
