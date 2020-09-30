import { ElementAst } from '@angular/compiler';
import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Enforces that no distracting elements are used',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Elements that can be visually distracting can cause accessibility issues with visually impaired users.',
    ruleName: 'template-no-distracting-elements',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'Avoid using <%s/> elements as they create visual accessibility issues.';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { templateVisitorCtrl: TemplateVisitorCtrl };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

export function getFailureMessage(element: string) {
  return sprintf(Rule.FAILURE_STRING, element);
}

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  visitElement(prop: ElementAst, context: any): any {
    this.validateElement(prop);
    super.visitElement(prop, context);
  }

  private validateElement(el: ElementAst): void {
    if (el.name === 'marquee' || el.name === 'blink') {
      const {
        sourceSpan: {
          end: { offset: endOffset },
          start: { offset: startOffset },
        },
      } = el;
      this.addFailureFromStartToEnd(startOffset, endOffset, getFailureMessage(el.name));
    }
  }
}
