import * as Lint from 'tslint';
import { IOptions } from 'tslint';
import * as ts from 'typescript';
import { ComponentMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'max-inline-declarations',
    type: 'maintainability',
    description: 'Disallows having too many lines in inline template or styles. Forces separate template or styles file creation.',
    descriptionDetails: 'See more at https://angular.io/guide/styleguide#style-05-04',
    options: {
      type: 'array',
      items: {
        type: 'object',
      }
    },
    optionsDescription: 'Define inline template and styles lines limit.',
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
    return this.applyWithWalker(new MaxInlineDeclarationsValidator(sourceFile, this, this.templateLinesLimit, this.stylesLinesLimit));
  }
}

export class MaxInlineDeclarationsValidator extends NgWalker {

  private newLineRegExp = /\r\n|\r|\n/;

  constructor(sourceFile: ts.SourceFile, private rule: Rule, private templateLinesLimit: number, private stylesLinesLimit: number) {
    super(sourceFile, rule.getOptions());
  }

  protected visitNgComponent(metadata: ComponentMetadata): void {
    this.validateInlineTemplate(metadata);
    this.validateInlineStyles(metadata);
    super.visitNgComponent(metadata);
  }

  private validateInlineTemplate(metadata: ComponentMetadata): void {
    if (this.hasInlineTemplate(metadata) && this.getTemplateLinesCount(metadata) > this.templateLinesLimit) {
      const templateLinesCount = this.getTemplateLinesCount(metadata);
      const msg = `Inline template lines limit exceeded. Defined limit: ${this.templateLinesLimit} / template lines: ${templateLinesCount}`;
      this.addFailureAtNode(metadata.template.node, msg);
    }
  }

  private hasInlineTemplate(metadata: ComponentMetadata): boolean {
    return !!metadata.template && !!metadata.template.template && !!metadata.template.template.source;
  }

  private getTemplateLinesCount(metadata: ComponentMetadata): number {
    return metadata.template.template.source.split(this.newLineRegExp).length;
  }

  private validateInlineStyles(metadata: ComponentMetadata): void {
    if (this.hasInlineStyles(metadata) && this.getStylesLinesCount(metadata) > this.stylesLinesLimit) {
      const stylesLinesCount = this.getStylesLinesCount(metadata);
      const msg = `Inline styles lines limit exceeded. Defined limit: ${this.stylesLinesLimit} / styles lines: ${stylesLinesCount}`;
      for (let i = 0; i < metadata.styles.length; i++) {
        this.addFailureAtNode(metadata.styles[i].node, msg);
      }
    }
  }

  private hasInlineStyles(metadata: ComponentMetadata): boolean {
    if (!metadata.styles) {
      return false;
    }

    for (let i = 0; i < metadata.styles.length; i++) {
      const style = metadata.styles[i];
      if (style.style && style.style.source) {
        return true;
      }
    }

    return false;
  }

  private getStylesLinesCount(metadata: ComponentMetadata) {
    let result = 0;
    for (let i = 0; i < metadata.styles.length; i++) {
      result += metadata.styles[i].style.source.split(this.newLineRegExp).length;
    }
    return result;
  }
}
