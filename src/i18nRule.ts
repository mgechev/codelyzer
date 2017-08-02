import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';
import * as ast from '@angular/compiler';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { ExpTypes } from './angular/expressionTypes';
import { Config } from './angular/config';
import { RecursiveAngularExpressionVisitor } from './angular/templates/recursiveAngularExpressionVisitor';

const getSemicolonReplacements = (
  text: ast.BoundDirectivePropertyAst,
  absolutePosition: number
) => {
  return [new Lint.Replacement(absolutePosition, 1, '; ')];
};

type Option = 'check-id' | 'check-i18n';

interface ConfigurableVisitor {
  getOption(): Option;
}

/* Interpolation visitors */

class I18NAttrVisitor extends BasicTemplateAstVisitor
  implements ConfigurableVisitor {
  visitAttr(attr: ast.AttrAst, context: BasicTemplateAstVisitor) {
    if (attr.name === 'i18n' && attr.value) {
      const parts = attr.value.split('@@');
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

class I18NTextVisitor extends BasicTemplateAstVisitor
  implements ConfigurableVisitor {
  visitAttr(attr: ast.AttrAst, context: BasicTemplateAstVisitor) {
    if (attr.name === 'i18n' && attr.value) {
      const parts = attr.value.split('@@');
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

class I18NTemplateVisitor extends BasicTemplateAstVisitor {
  private visitors: (BasicTemplateAstVisitor & ConfigurableVisitor)[] = [
    new I18NAttrVisitor(
      this.getSourceFile(),
      this.getOptions(),
      this.context,
      this.templateStart
    ),
    new I18NTextVisitor(
      this.getSourceFile(),
      this.getOptions(),
      this.context,
      this.templateStart
    )
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
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'i18n',
    type: 'maintainability',
    description: `Ensures following best practices for i18n.`,
    rationale: `Makes the code more maintainable in i18n sense.`,
    optionsDescription: Lint.Utils.dedent`
      Arguments may be optionally provided:
      * \`"check-id"\` Makes sure i18n attributes have ID specified
    `,

    options: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['check-id']
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
