import { ElementAst } from '@angular/compiler';
import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that the click event is accompanied with at least one key event keyup, keydown or keypress',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Keyboard is important for users with physical disabilities who cannot use mouse.',
    ruleName: 'template-click-events-have-key-events',
    type: 'functionality',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'click must be accompanied by either keyup, keydown or keypress event for accessibility';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: TemplateClickEventsHaveKeyEventsVisitor
      })
    );
  }
}

class TemplateClickEventsHaveKeyEventsVisitor extends BasicTemplateAstVisitor {
  visitElement(el: ElementAst, context: any) {
    this.validateElement(el);
    super.visitElement(el, context);
  }

  private validateElement(el: ElementAst): void {
    const hasClick = el.outputs.some(output => output.name === 'click');
    if (!hasClick) {
      return;
    }
    const hasKeyEvent = el.outputs.some(output => output.name === 'keyup' || output.name === 'keydown' || output.name === 'keypress');

    if (hasKeyEvent) {
      return;
    }

    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset }
      }
    } = el;

    this.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_STRING);
  }
}
