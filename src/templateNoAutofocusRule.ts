import { AttrAst, BoundElementPropertyAst } from '@angular/compiler';
import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensure that autofocus property is not used',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'autofocus attribute reduces usability and accessibility for users.',
    ruleName: 'template-no-autofocus',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'autofocus attribute should not be used, as it reduces usability and accessibility for users.';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { templateVisitorCtrl: TemplateVisitorCtrl };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  visitAttr(ast: AttrAst, context: any) {
    this.validateAttribute(ast);
    super.visitAttr(ast, context);
  }

  visitElementProperty(ast: BoundElementPropertyAst) {
    this.validateAttribute(ast);
    super.visitElementProperty(ast, context);
  }

  validateAttribute(ast: AttrAst | BoundElementPropertyAst) {
    if (ast.name === 'autofocus') {
      const {
        sourceSpan: {
          end: { offset: endOffset },
          start: { offset: startOffset },
        },
      } = ast;
      this.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_STRING);
    }
  }
}
