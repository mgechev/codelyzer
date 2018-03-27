import * as Lint from 'tslint';
import { IOptions } from 'tslint';
import * as ts from 'typescript';
import { ComponentMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'inline-template-max-lines',
    type: 'maintainability',
    description: 'Disallows having to many lines in inline template. Forces separate template file creation.',
    descriptionDetails: 'See more at https://angular.io/guide/styleguide#style-05-04',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
    hasFix: false
  };

  private linesLimit: number = 3;

  constructor(options: IOptions) {
    super(options);
    if (options.ruleArguments.length > 0 && options.ruleArguments[0] > -1) {
      this.linesLimit = options.ruleArguments[0];
    }
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new InlineTemplateMaxLinesValidator(sourceFile, this, this.linesLimit));
  }
}

export class InlineTemplateMaxLinesValidator extends NgWalker {

  constructor(sourceFile: ts.SourceFile, private rule: Rule, private linesLimit) {
    super(sourceFile, rule.getOptions());
  }

  protected visitNgComponent(metadata: ComponentMetadata): void {
    if (this.hasInlineTemplate(metadata) && this.getTemplateLineCount(metadata) > this.linesLimit) {
      this.addFailureAtNode(metadata.template.node, 'Defined inline template lines count limit exceeded.');
    }
    super.visitNgComponent(metadata);
  }

  private hasInlineTemplate(meta: ComponentMetadata): boolean {
    return !!meta.template && !!meta.template.template && !!meta.template.template.source;
  }

  private getTemplateLineCount(meta: ComponentMetadata): number {
    return meta.template.template.source.split(/\r\n|\r|\n/).length;
  }
}
