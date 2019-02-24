import { BoundEventAst } from '@angular/compiler';
import { IRuleMetadata, Replacement, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

const INVALID_BOX = /^\[(?!\()(.*)(?<!\))\]$/;
const VALID_CLOSE_BOX = ')]';
const VALID_OPEN_BOX = '[(';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that the two-way data binding syntax is correct.',
    hasFix: true,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'The parentheses "()" should have been inside the brackets "[]".',
    ruleName: 'template-banana-in-box',
    type: 'functionality',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Invalid binding syntax. Use [(expr)] instead';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: TemplateBananaInBoxVisitor
      })
    );
  }
}

class TemplateBananaInBoxVisitor extends BasicTemplateAstVisitor {
  visitEvent(ast: BoundEventAst, context: BasicTemplateAstVisitor): any {
    this.validateEvent(ast);
    super.visitEvent(ast, context);
  }

  private validateEvent(ast: BoundEventAst): void {
    const matches = ast.name.match(INVALID_BOX);

    if (!matches) return;

    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset }
      }
    } = ast;
    const text = matches[1];
    const absoluteStartPosition = this.getSourcePosition(startOffset);
    const absoluteEndPosition = absoluteStartPosition + VALID_OPEN_BOX.length + text.length + VALID_CLOSE_BOX.length;
    const newText = `${VALID_OPEN_BOX}${text}${VALID_CLOSE_BOX}`;
    const fix = Replacement.replaceFromTo(absoluteStartPosition, absoluteEndPosition, newText);

    this.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_STRING, fix);
  }
}
