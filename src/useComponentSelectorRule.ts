import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { SourceFile } from 'typescript';
import { ComponentMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';

interface FailureParameters {
  readonly className: string;
}

export const getFailureMessage = (failureParameters: FailureParameters): string =>
  sprintf(Rule.FAILURE_STRING, failureParameters.className);

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Component selector must be declared.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Omit the component selector makes debugging difficult.',
    ruleName: 'use-component-selector',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'The selector of the component "%s" is mandatory';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  protected visitNgComponent(metadata: ComponentMetadata): void {
    this.validateComponent(metadata);
    super.visitNgComponent(metadata);
  }

  private validateComponent(metadata: ComponentMetadata): void {
    const {
      decorator: metadataDecorator,
      controller: { name: controllerName },
      selector: metadataSelector,
    } = metadata;

    if (metadataSelector || !controllerName) return;

    const failure = getFailureMessage({ className: controllerName.text });

    this.addFailureAtNode(metadataDecorator, failure);
  }
}
