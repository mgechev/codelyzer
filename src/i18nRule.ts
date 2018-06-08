import * as ast from '@angular/compiler';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

const OPTION_CHECK_ID = 'check-id';
const OPTION_CHECK_TEXT = 'check-text';

type CheckOption = typeof OPTION_CHECK_ID | typeof OPTION_CHECK_TEXT;

interface ConfigurableVisitor {
  getCheckOption(): CheckOption;
}

class I18NAttrVisitor extends BasicTemplateAstVisitor implements ConfigurableVisitor {
  visitAttr(attr: ast.AttrAst, context: BasicTemplateAstVisitor) {
    if (attr.name === 'i18n') {
      const parts = (attr.value || '').split('@@');
      if (parts.length <= 1 || parts[1].length === 0) {
        const {
          sourceSpan: {
            end: { offset: endOffset },
            start: { offset: startOffset }
          }
        } = attr;

        context.addFailureFromStartToEnd(
          startOffset,
          endOffset,
          'Missing custom message identifier. For more information visit https://angular.io/guide/i18n'
        );
      }
    }
    super.visitAttr(attr, context);
  }

  getCheckOption(): CheckOption {
    return 'check-id';
  }
}

class I18NTextVisitor extends BasicTemplateAstVisitor implements ConfigurableVisitor {
  static Error = 'Each element containing text node should have an i18n attribute';

  private hasI18n = false;
  private nestedElements: string[] = [];
  private visited = new Set<ast.TextAst | ast.BoundTextAst>();

  visitText(text: ast.TextAst, context: BasicTemplateAstVisitor) {
    if (!this.visited.has(text)) {
      this.visited.add(text);
      const textNonEmpty = text.value.trim().length > 0;
      if ((!this.hasI18n && textNonEmpty && this.nestedElements.length) || (textNonEmpty && !this.nestedElements.length)) {
        const {
          sourceSpan: {
            end: { offset: endOffset },
            start: { offset: startOffset }
          }
        } = text;

        context.addFailureFromStartToEnd(startOffset, endOffset, I18NTextVisitor.Error);
      }
    }
    super.visitText(text, context);
  }

  visitBoundText(text: ast.BoundTextAst, context: BasicTemplateAstVisitor) {
    if (!this.visited.has(text)) {
      this.visited.add(text);
      const val = text.value;
      if (val instanceof ast.ASTWithSource && val.ast instanceof ast.Interpolation && !this.hasI18n) {
        const textNonEmpty = val.ast.strings.some(s => /\w+/.test(s));
        if (textNonEmpty) {
          const {
            sourceSpan: {
              end: { offset: endOffset },
              start: { offset: startOffset }
            }
          } = text;

          context.addFailureFromStartToEnd(startOffset, endOffset, I18NTextVisitor.Error);
        }
      }
    }

    super.visitBoundText(text, context);
  }

  visitElement(element: ast.ElementAst, context: BasicTemplateAstVisitor) {
    const originalI18n = this.hasI18n;
    this.hasI18n = originalI18n || element.attrs.some(e => e.name === 'i18n');
    this.nestedElements.push(element.name);
    super.visitElement(element, context);
    this.nestedElements.pop();
    this.hasI18n = originalI18n;
    super.visitElement(element, context);
  }

  getCheckOption(): CheckOption {
    return 'check-text';
  }
}

class I18NTemplateVisitor extends BasicTemplateAstVisitor {
  private visitors: (BasicTemplateAstVisitor & ConfigurableVisitor)[] = [
    new I18NAttrVisitor(this.getSourceFile(), this.getOptions(), this.context, this.templateStart),
    new I18NTextVisitor(this.getSourceFile(), this.getOptions(), this.context, this.templateStart)
  ];

  visit(node: ast.TemplateAst, context: BasicTemplateAstVisitor) {
    super.visit!(node, context);
  }

  visitAttr(attr: ast.AttrAst, context: BasicTemplateAstVisitor): any {
    const options = this.getOptions();
    this.visitors
      .filter(v => options.indexOf(v.getCheckOption()) >= 0)
      .map(v => v.visitAttr(attr, this))
      .filter(Boolean)
      .forEach(f =>
        this.addFailureFromStartToEnd(f.getStartPosition().getPosition(), f.getEndPosition().getPosition(), f.getFailure(), f.getFix())
      );
    super.visitAttr(attr, context);
  }

  visitElement(element: ast.ElementAst, context: BasicTemplateAstVisitor): any {
    const options = this.getOptions();
    this.visitors
      .filter(v => options.indexOf(v.getCheckOption()) >= 0)
      .map(v => v.visitElement(element, this))
      .filter(Boolean)
      .forEach(f =>
        this.addFailureFromStartToEnd(f.getStartPosition().getPosition(), f.getEndPosition().getPosition(), f.getFailure(), f.getFix())
      );
    super.visitElement(element, context);
  }

  visitText(text: ast.TextAst, context: BasicTemplateAstVisitor): any {
    const options = this.getOptions();
    this.visitors
      .filter(v => options.indexOf(v.getCheckOption()) >= 0)
      .map(v => v.visitText(text, this))
      .filter(Boolean)
      .forEach(f =>
        this.addFailureFromStartToEnd(f.getStartPosition().getPosition(), f.getEndPosition().getPosition(), f.getFailure(), f.getFix())
      );
    super.visitText(text, context);
  }

  visitBoundText(text: ast.BoundTextAst, context: any): any {
    const options = this.getOptions();
    this.visitors
      .filter(v => options.indexOf(v.getCheckOption()) >= 0)
      .map(v => v.visitBoundText(text, this))
      .filter(Boolean)
      .forEach(f =>
        this.addFailureFromStartToEnd(f.getStartPosition().getPosition(), f.getEndPosition().getPosition(), f.getFailure(), f.getFix())
      );
    super.visitBoundText(text, context);
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Ensures following best practices for i18n.',
    optionExamples: [[true, OPTION_CHECK_ID], [true, OPTION_CHECK_TEXT], [true, OPTION_CHECK_ID, OPTION_CHECK_TEXT]],
    options: {
      items: {
        enum: [OPTION_CHECK_ID, OPTION_CHECK_TEXT],
        type: 'string'
      },
      maxLength: 2,
      minLength: 1,
      type: 'array'
    },
    optionsDescription: Lint.Utils.dedent`
      One (or both) of the following arguments must be provided:
      * \`${OPTION_CHECK_ID}\` Makes sure i18n attributes have ID specified
      * \`${OPTION_CHECK_TEXT}\` Makes sure there are no elements with text content but no i18n attribute
    `,
    rationale: 'Makes the code more maintainable in i18n sense.',
    ruleName: 'i18n',
    type: 'maintainability',
    typescriptOnly: true
  };

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: I18NTemplateVisitor
      })
    );
  }

  isEnabled(): boolean {
    const {
      metadata: {
        options: { maxLength, minLength }
      }
    } = Rule;
    const { length } = this.ruleArguments;

    return super.isEnabled() && length >= minLength && length <= maxLength;
  }
}
