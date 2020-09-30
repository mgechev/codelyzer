import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { SourceFile } from 'typescript';
import { InjectableMetadata } from './angular';
import { NgWalker } from './angular/ngWalker';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: "Enforces classes decorated with @Injectable to use the 'providedIn' property.",
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: "Using the 'providedIn' property makes classes decorated with @Injectable tree shakeable.",
    ruleName: 'use-injectable-provided-in',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = "Classes decorated with @Injectable should use the 'providedIn' property";

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  protected visitNgInjectable(metadata: InjectableMetadata): void {
    this.validateInjectable(metadata);
    super.visitNgInjectable(metadata);
  }

  private validateInjectable(metadata: InjectableMetadata): void {
    if (metadata.providedIn) return;

    this.addFailureAtNode(metadata.decorator, Rule.FAILURE_STRING);
  }
}
