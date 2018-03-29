import * as Lint from 'tslint';
import { IOptions } from 'tslint';
import * as ts from 'typescript';
import { ComponentMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'inline-template-max-lines',
    type: 'maintainability',
    description: 'Disallows having too many lines in inline template or styles. Forces separate template or styles file creation.',
    descriptionDetails: 'See more at https://angular.io/guide/styleguide#style-05-04',
    options: {
      type: 'array',
      items: {
        type: 'object',
      }
    },
    optionsDescription: 'Define inline template lines limit.',
    optionExamples: ['[{template: 5, styles: 8}]'],
    typescriptOnly: true,
    hasFix: false
  };

  private templateLinesLimit: number = 3;
  private stylesLinesLimit: number = 3;

  constructor(options: IOptions) {
    super(options);
    if (options.ruleArguments.length > 1) {
      const args = options.ruleArguments[1];
      if (args.template > -1) {
        this.templateLinesLimit = args.template;
      }
      if (args.styles > -1) {
        this.stylesLinesLimit = args.styles;
      }
    }
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new MaxInlineDeclarationsValidator(sourceFile, this, this.templateLinesLimit));
  }
}

export class MaxInlineDeclarationsValidator extends NgWalker {

  constructor(sourceFile: ts.SourceFile, private rule: Rule, private linesLimit) {
    super(sourceFile, rule.getOptions());
  }

  protected visitNgComponent(metadata: ComponentMetadata): void {
    this.validateInlineTemplate(metadata);
    super.visitNgComponent(metadata);
  }

  private validateInlineTemplate(metadata: ComponentMetadata): void {
    if (this.hasInlineTemplate(metadata) && this.getTemplateLineCount(metadata) > this.linesLimit) {
      const templateLinesCount = this.getTemplateLineCount(metadata);
      const message = `Inline template lines limit exceeded. Defined limit: ${this.linesLimit} / template lines: ${templateLinesCount}`;
      this.addFailureAtNode(metadata.template.node, message);
    }
  }

  private hasInlineTemplate(meta: ComponentMetadata): boolean {
    return !!meta.template && !!meta.template.template && !!meta.template.template.source;
  }

  private getTemplateLineCount(meta: ComponentMetadata): number {
    return meta.template.template.source.split(/\r\n|\r|\n/).length;
  }
}
