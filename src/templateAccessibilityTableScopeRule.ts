import { ElementAst } from '@angular/compiler';
import { IRuleMetadata, RuleFailure, Rules, Utils } from 'tslint/lib';
import { SourceFile } from 'typescript';
import { BasicTemplateAstVisitor } from './angular';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  visitElement(ast: ElementAst, context: any) {
    this.validateElement(ast);
    super.visitElement(ast, context);
  }

  validateElement(element: ElementAst) {
    if (element.name === 'th') {
      return;
    }

    const hasScopeInput = element.inputs.some((input) => input.name === 'scope');
    const hasScopeAttr = element.attrs.some((attr) => attr.name === 'scope');
    if (hasScopeInput || hasScopeAttr) {
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

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that scope is not used on any element except th',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: Utils.dedent`
    The scope attribute makes table navigation much easier for screen reader users, provided that it is used correctly.
    If used incorrectly, it can make table navigation much harder and less efficient. (aXe)
    `,
    ruleName: 'template-accessibility-table-scope',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_MESSAGE = 'Scope attribute can only be on <th> element';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { templateVisitorCtrl: TemplateVisitorCtrl };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}
