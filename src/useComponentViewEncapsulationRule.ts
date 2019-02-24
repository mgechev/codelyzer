import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { isPropertyAccessExpression, SourceFile } from 'typescript/lib/typescript';
import { ComponentMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';
import { getDecoratorPropertyInitializer } from './util/utils';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Disallows using of ViewEncapsulation.None.',
    options: null,
    optionsDescription: 'Not configurable.',
    ruleName: 'use-component-view-encapsulation',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Using "ViewEncapsulation.None" makes your styles global, which may have an unintended effect';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new ViewEncapsulationWalker(sourceFile, this.getOptions()));
  }
}

class ViewEncapsulationWalker extends NgWalker {
  protected visitNgComponent(metadata: ComponentMetadata): void {
    this.validateComponent(metadata);
    super.visitNgComponent(metadata);
  }

  private validateComponent(metadata: ComponentMetadata): void {
    const encapsulation = getDecoratorPropertyInitializer(metadata.decorator, 'encapsulation');

    if (!encapsulation || (isPropertyAccessExpression(encapsulation) && encapsulation.name.text !== 'None')) {
      return;
    }

    this.addFailureAtNode(encapsulation, Rule.FAILURE_STRING);
  }
}
