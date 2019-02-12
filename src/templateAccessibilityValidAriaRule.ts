import { AttrAst, BoundElementPropertyAst } from '@angular/compiler';
import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { aria } from 'aria-query';
import { getSuggestion } from './util/getSuggestion';

const ariaAttributes: string[] = [...(<string[]>Array.from(aria.keys()))];

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that the correct ARIA attributes are used',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Elements should not use invalid aria attributes (AX_ARIA_11)',
    ruleName: 'template-accessibility-valid-aria',
    type: 'functionality',
    typescriptOnly: true
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: TemplateAccessibilityValidAriaVisitor
      })
    );
  }
}

export const getFailureMessage = (name: string): string => {
  const suggestions = getSuggestion(name, ariaAttributes);
  const message = `${name}: This attribute is an invalid ARIA attribute.`;

  if (suggestions.length > 0) {
    return `${message} Did you mean to use ${suggestions}?`;
  }

  return message;
};

class TemplateAccessibilityValidAriaVisitor extends BasicTemplateAstVisitor {
  visitAttr(ast: AttrAst, context: any) {
    this.validateAttribute(ast);
    super.visitAttr(ast, context);
  }

  visitElementProperty(ast: BoundElementPropertyAst) {
    this.validateAttribute(ast);
    super.visitElementProperty(ast, context);
  }

  private validateAttribute(ast: AttrAst | BoundElementPropertyAst) {
    if (ast.name.indexOf('aria-') !== 0) return;
    const isValid = ariaAttributes.indexOf(ast.name) > -1;
    if (isValid) return;

    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset }
      }
    } = ast;
    this.addFailureFromStartToEnd(startOffset, endOffset, getFailureMessage(ast.name));
  }
}
