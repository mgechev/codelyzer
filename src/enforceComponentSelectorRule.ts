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
    return this.applyWithWalker(new EnforceComponentSelectorValidatorWalker(sourceFile, this.getOptions()));
  }
}

export class EnforceComponentSelectorValidatorWalker extends NgWalker {
  protected visitNgComponent(metadata: ComponentMetadata) {
    if (!metadata.selector) {
      this.addFailureAtNode(metadata.decorator, sprintf(Rule.SELECTOR_FAILURE, metadata.controller.name!.text));
    }

    super.visitNgComponent(metadata);
  }
}
