import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';
import * as ast from '@angular/compiler';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

type Option = 'check-id' | 'check-text';

interface ConfigurableVisitor {
  getOption(): Option;
}

class I18NAttrVisitor extends BasicTemplateAstVisitor implements ConfigurableVisitor {
  visitAttr(attr: ast.AttrAst, context: BasicTemplateAstVisitor) {
    if (attr.name === 'i18n') {
      const parts = (attr.value || '').split('@@');
      if (parts.length <= 1 || parts[1].length === 0) {
        const span = attr.sourceSpan;
        context.addFailure(
          context.createFailure(
            span.start.offset,
            span.end.offset - span.start.offset,
            'Missing custom message identifier. For more information visit https://angular.io/guide/i18n'
          )
        );
      }
    }
    super.visitAttr(attr, context);
  }
  getOption(): Option {
    return 'check-id';
  }
}

class I18NTextVisitor extends BasicTemplateAstVisitor implements ConfigurableVisitor {
  static Error = 'Each element containing text node should have an i18n attribute';

  private hasI18n = false;
  private nestedElements = [];
  private visited = new Set<ast.TextAst | ast.BoundTextAst>();

  visitText(text: ast.TextAst, context: BasicTemplateAstVisitor) {
    if (!this.visited.has(text)) {
      this.visited.add(text);
      const textNonEmpty = text.value.trim().length > 0;
      if (
        (!this.hasI18n && textNonEmpty && this.nestedElements.length) ||
        (textNonEmpty && !this.nestedElements.length)
      ) {
        const span = text.sourceSpan;
        context.addFailure(
          context.createFailure(span.start.offset, span.end.offset - span.start.offset, I18NTextVisitor.Error)
        );
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
          const span = text.sourceSpan;
          context.addFailure(
            context.createFailure(span.start.offset, span.end.offset - span.start.offset, I18NTextVisitor.Error)
          );
        }
      }
    }
  }

  visitElement(element: ast.ElementAst, context: BasicTemplateAstVisitor) {
    this.hasI18n = element.attrs.some(e => e.name === 'i18n');
    this.nestedElements.push(element.name);
    super.visitElement(element, context);
    this.nestedElements.pop();
    this.hasI18n = false;
  }

  getOption(): Option {
    return 'check-text';
  }
}

class I18NTemplateVisitor extends BasicTemplateAstVisitor {
  private visitors: (BasicTemplateAstVisitor & ConfigurableVisitor)[] = [
    new I18NAttrVisitor(this.getSourceFile(), this.getOptions(), this.context, this.templateStart),
    new I18NTextVisitor(this.getSourceFile(), this.getOptions(), this.context, this.templateStart)
  ];

  visit(a: any, context: any) {
    super.visit(a, context);
  }

  visitAttr(attr: ast.AttrAst, context: any): any {
    const options = this.getOptions();
    this.visitors
      .filter(v => options.indexOf(v.getOption()) >= 0)
      .map(v => v.visitAttr(attr, this))
      .filter(f => !!f)
      .forEach(f => this.addFailure(f));
    super.visitAttr(attr, context);
  }

  visitElement(element: ast.ElementAst, context: any): any {
    const options = this.getOptions();
    this.visitors
      .filter(v => options.indexOf(v.getOption()) >= 0)
      .map(v => v.visitElement(element, this))
      .filter(f => !!f)
      .forEach(f => this.addFailure(f));
    super.visitElement(element, context);
  }

  visitText(text: ast.TextAst, context: any): any {
    const options = this.getOptions();
    this.visitors
      .filter(v => options.indexOf(v.getOption()) >= 0)
      .map(v => v.visitText(text, this))
      .filter(f => !!f)
      .forEach(f => this.addFailure(f));
    super.visitText(text, context);
  }

  visitBoundText(text: ast.BoundTextAst, context: any): any {
    const options = this.getOptions();
    this.visitors
      .filter(v => options.indexOf(v.getOption()) >= 0)
      .map(v => v.visitBoundText(text, this))
      .filter(f => !!f)
      .forEach(f => this.addFailure(f));
    super.visitBoundText(text, context);
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'i18n',
    type: 'maintainability',
    description: 'Ensures following best practices for i18n.',
    rationale: 'Makes the code more maintainable in i18n sense.',
    optionsDescription: Lint.Utils.dedent`
      Arguments may be optionally provided:
      * \`"check-id"\` Makes sure i18n attributes have ID specified
      * \`"check-text"\` Makes sure there are no elements with text content but no i18n attribute
    `,

    options: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['check-id', 'check-text']
      },
      minLength: 0,
      maxLength: 3
    },
    optionExamples: ['[true, "check-id"]'],
    typescriptOnly: true
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: I18NTemplateVisitor
      })
    );
  }
}
