import { IRuleMetadata, RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { isPropertyAccessExpression, SourceFile } from 'typescript/lib/typescript';
import { ComponentMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';
import { getDecoratorPropertyInitializer } from './util/utils';

const NONE = 'None';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: `Disallows using ViewEncapsulation.${NONE}.`,
    options: null,
    optionsDescription: 'Not configurable.',
    ruleName: 'use-component-view-encapsulation',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = `Using ViewEncapsulation.${NONE} makes your styles global, which may have an unintended effect`;

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
    const encapsulationExpression = getDecoratorPropertyInitializer(metadata.decorator, 'encapsulation');

    if (!encapsulationExpression || (isPropertyAccessExpression(encapsulationExpression) && encapsulationExpression.name.text !== NONE)) {
      return;
    }

    this.addFailureAtNode(encapsulationExpression, Rule.FAILURE_STRING);
  }
}
