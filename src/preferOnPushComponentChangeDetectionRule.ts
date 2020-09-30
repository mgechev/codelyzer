import { IRuleMetadata, RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import { isPropertyAccessExpression, SourceFile } from 'typescript/lib/typescript';
import { ComponentMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';
import { getDecoratorPropertyInitializer } from './util/utils';

const ON_PUSH = 'OnPush';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: `Enforces component's change detection to ChangeDetectionStrategy.${ON_PUSH}.`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: dedent`
      By default Angular uses the ChangeDetectionStrategy.Default.

      This strategy doesn’t assume anything about the application, therefore every time something changes in our application, as a result of various user events, timers, XHR, promises, etc., a change detection will run on all components.

      By using ChangeDetectionStrategy.${ON_PUSH}, Angular will only run the change detection cycle in the following cases:
      * Inputs references change.
      * An event originated from the component or one of its children.
      * If manually called.
    `,
    ruleName: 'prefer-on-push-component-change-detection',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = `The changeDetection value of a component should be set to ChangeDetectionStrategy.${ON_PUSH}`;

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
    const { decorator: metadataDecorator } = metadata;
    const changeDetectionExpression = getDecoratorPropertyInitializer(metadataDecorator, 'changeDetection');

    if (!changeDetectionExpression) {
      this.addFailureAtNode(metadataDecorator, Rule.FAILURE_STRING);
    } else if (isPropertyAccessExpression(changeDetectionExpression) && changeDetectionExpression.name.text !== ON_PUSH) {
      this.addFailureAtNode(changeDetectionExpression, Rule.FAILURE_STRING);
    }
  }
}
