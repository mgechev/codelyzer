import { ElementAst } from '@angular/compiler';
import { dom } from 'aria-query';
import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { isHiddenFromScreenReader } from './util/isHiddenFromScreenReader';
import { isInteractiveElement } from './util/isInteractiveElement';
import { isPresentationRole } from './util/isPresentationRole';

const domElements = new Set(dom.keys());

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that the click event is accompanied with at least one key event keyup, keydown or keypress',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Keyboard is important for users with physical disabilities who cannot use mouse.',
    ruleName: 'template-click-events-have-key-events',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'click must be accompanied by either keyup, keydown or keypress event for accessibility';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { templateVisitorCtrl: TemplateVisitorCtrl };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  visitElement(el: ElementAst, context: any) {
    this.validateElement(el);
    super.visitElement(el, context);
  }

  private validateElement(el: ElementAst): void {
    const hasClick = el.outputs.some((output) => output.name === 'click');
    if (!hasClick) {
      return;
    }

    if (!domElements.has(el.name)) {
      // Do not test components, as we do not know what
      // low-level DOM element this maps to.
      return;
    }

    if (isPresentationRole(el) || isHiddenFromScreenReader(el)) {
      return;
    }

    if (isInteractiveElement(el)) {
      return;
    }
    const hasKeyEvent = el.outputs.some(
      (output) => output.name.startsWith('keyup') || output.name.startsWith('keydown') || output.name.startsWith('keypress')
    );

    if (hasKeyEvent) {
      return;
    }

    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset },
      },
    } = el;

    this.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_STRING);
  }
}
