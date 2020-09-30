import { ElementAst } from '@angular/compiler';
import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that the Mouse Events mouseover and mouseout are accompanied with Key Events focus and blur',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Keyboard is important for users with physical disabilities who cannot use mouse.',
    ruleName: 'template-mouse-events-have-key-events',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING_MOUSE_OVER = 'mouseover must be accompanied by focus event for accessibility';
  static readonly FAILURE_STRING_MOUSE_OUT = 'mouseout must be accompanied by blur event for accessibility';

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
    const hasMouseOver = el.outputs.some((output) => output.name === 'mouseover');
    const hasMouseOut = el.outputs.some((output) => output.name === 'mouseout');
    const hasFocus = el.outputs.some((output) => output.name === 'focus');
    const hasBlur = el.outputs.some((output) => output.name === 'blur');

    if (!hasMouseOver && !hasMouseOut) {
      return;
    }

    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset },
      },
    } = el;

    if (hasMouseOver && !hasFocus) {
      this.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_STRING_MOUSE_OVER);
    }

    if (hasMouseOut && !hasBlur) {
      this.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_STRING_MOUSE_OUT);
    }
  }
}
