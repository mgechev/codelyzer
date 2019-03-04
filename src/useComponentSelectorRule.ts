import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { SourceFile } from 'typescript';
import { ComponentMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';

export const getFailureMessage = (): string => sprintf(Rule.FAILURE_STRING);

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Component selector must be declared.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Omit the component selector makes debugging difficult.',
    ruleName: 'use-component-selector',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'A component must have a selector';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new UseComponentSelectorValidatorWalker(sourceFile, this.getOptions()));
  }
}

class UseComponentSelectorValidatorWalker extends NgWalker {
  protected visitNgComponent(metadata: ComponentMetadata): void {
    this.validateComponent(metadata);
    super.visitNgComponent(metadata);
  }

  private validateComponent(metadata: ComponentMetadata): void {
    const {
      decorator: metadataDecorator,
      controller: { name: controllerName },
      selector: metadataSelector
    } = metadata;

    if (metadataSelector || !controllerName) return;

    const failure = getFailureMessage();

    this.addFailureAtNode(metadataDecorator, failure);
  }
}
