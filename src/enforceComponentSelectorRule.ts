import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { NgWalker } from './angular/ngWalker';
import { ComponentMetadata } from './angular/metadata';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'enforce-component-selector',
    type: 'style',
    description: 'Component selector must be declared.',
    rationale: 'Omit the component selector makes debugging difficult.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true
  };

  static SELECTOR_FAILURE = 'The selector of the component "%s" is mandatory';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new EnforceComponentSelectorValidatorWalker(sourceFile, this));
  }
}

export class EnforceComponentSelectorValidatorWalker extends NgWalker {
  constructor(sourceFile: ts.SourceFile, private rule: Rule) {
    super(sourceFile, rule.getOptions());
  }

  visitNgComponent(metadata: ComponentMetadata) {
    if (!metadata.selector) {
      const failureConfig: string[] = [metadata.controller.name.text];
      failureConfig.unshift(Rule.SELECTOR_FAILURE);
      this.generateFailure(metadata.decorator.getStart(), metadata.decorator.getWidth(), failureConfig);
    }
    super.visitNgComponent(metadata);
  }

  private generateFailure(start: number, width: number, failureConfig: string[]) {
    this.addFailure(this.createFailure(start, width, sprintf.apply(this, failureConfig)));
  }
}
