import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { createNodeArray, Decorator, isClassDeclaration, SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import {
  DecoratorKeys,
  Decorators,
  getDecoratorName,
  getNextToLastParentNode,
  isMetadataType,
  isNgDecorator,
  METADATA_TYPE_DECORATOR_MAPPER,
  MetadataTypes
} from './util/utils';

interface FailureParameters {
  readonly className: string;
  readonly decoratorName: DecoratorKeys;
  readonly metadataType: MetadataTypes;
}

export const getFailureMessage = (failureParameters: FailureParameters): string =>
  sprintf(Rule.FAILURE_STRING, failureParameters.decoratorName, failureParameters.className, failureParameters.metadataType);

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that classes use allowed decorator in its body.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: `Some decorators can only be used in certain class types. For example, an @${Decorators.Input} should not be used in an @${
      MetadataTypes.Injectable
    } class.`,
    ruleName: 'contextual-decorator',
    type: 'functionality',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'The decorator "%s" is not allowed for class "%s" because it is decorated with "%s"';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new ContextualDecoratorWalker(sourceFile, this.getOptions()));
  }
}

export class ContextualDecoratorWalker extends NgWalker {
  protected visitMethodDecorator(decorator: Decorator): void {
    this.validateDecorator(decorator);
    super.visitMethodDecorator(decorator);
  }

  protected visitPropertyDecorator(decorator: Decorator): void {
    this.validateDecorator(decorator);
    super.visitPropertyDecorator(decorator);
  }

  private validateDecorator(decorator: Decorator): void {
    const klass = getNextToLastParentNode(decorator);

    if (!isClassDeclaration(klass) || !klass.name) return;

    const metadataType = createNodeArray(klass.decorators)
      .map(x => x.expression.getText())
      .map(x => x.replace(/[^a-zA-Z]/g, ''))
      .find(isMetadataType);

    if (!metadataType) return;

    const decoratorName = getDecoratorName(decorator);

    if (!decoratorName || !isNgDecorator(decoratorName)) return;

    const allowedDecorators = METADATA_TYPE_DECORATOR_MAPPER[metadataType];

    if (!allowedDecorators || allowedDecorators.has(decoratorName)) return;

    const className = klass.name.getText();
    const failure = getFailureMessage({ className, decoratorName, metadataType });

    this.addFailureAtNode(decorator, failure);
  }
}
