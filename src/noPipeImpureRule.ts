import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { SourceFile, SyntaxKind } from 'typescript';
import { PipeMetadata } from './angular';
import { NgWalker } from './angular/ngWalker';
import { getClassName } from './util/utils';

interface FailureParameters {
  readonly className: string;
}

export const getFailureMessage = (failureParameters: FailureParameters): string =>
  sprintf(Rule.FAILURE_STRING, failureParameters.className);

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Disallows the declaration of impure pipes.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Impure pipes should be avoided because they are invoked on each change-detection cycle.',
    ruleName: 'no-pipe-impure',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'Impure pipe declared in class %s';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  protected visitNgPipe(metadata: PipeMetadata): void {
    this.validatePipe(metadata);
    super.visitNgPipe(metadata);
  }

  private validatePipe(metadata: PipeMetadata): void {
    if (!metadata.pure || metadata.pure.kind !== SyntaxKind.FalseKeyword) return;

    const className = getClassName(metadata.controller)!;

    const failure = getFailureMessage({ className });

    this.addFailureAtNode(metadata.pure, failure);
  }
}
