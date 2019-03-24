import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import { createNodeArray, Decorator, isClassDeclaration, SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import {
  ANGULAR_CLASS_DECORATOR_MAPPER,
  AngularClassDecoratorKeys,
  AngularClassDecorators,
  AngularInnerClassDecoratorKeys,
  AngularInnerClassDecorators,
  getDecoratorName,
  getNextToLastParentNode,
  isAngularClassDecorator,
  isAngularInnerClassDecorator
} from './util/utils';

interface FailureParameters {
  readonly className: string;
  readonly classDecoratorName: AngularClassDecoratorKeys;
  readonly innerClassDecoratorName: AngularInnerClassDecoratorKeys;
}

export const getFailureMessage = (failureParameters: FailureParameters): string =>
  sprintf(
    Rule.FAILURE_STRING,
    failureParameters.innerClassDecoratorName,
    failureParameters.className,
    failureParameters.classDecoratorName
  );

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that classes use allowed decorator in its body.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: dedent`Some decorators can only be used in certain class types.
      For example, an @${AngularInnerClassDecorators.Input} should not be used
      in an @${AngularClassDecorators.Injectable} class.
    `,
    ruleName: 'contextual-decorator',
    type: 'functionality',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'The decorator "%s" is not allowed for class "%s" because it is decorated with "%s"';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
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

    const classDecoratorName = createNodeArray(klass.decorators)
      .map(x => x.expression.getText())
      .map(x => x.replace(/[^a-zA-Z]/g, ''))
      .find(isAngularClassDecorator);

    if (!classDecoratorName) return;

    const innerClassDecoratorName = getDecoratorName(decorator);

    if (!innerClassDecoratorName || !isAngularInnerClassDecorator(innerClassDecoratorName)) return;

    const allowedDecorators = ANGULAR_CLASS_DECORATOR_MAPPER.get(classDecoratorName);

    if (!allowedDecorators || allowedDecorators.has(innerClassDecoratorName)) return;

    const className = klass.name.getText();
    const failure = getFailureMessage({ classDecoratorName, className, innerClassDecoratorName });

    this.addFailureAtNode(decorator, failure);
  }
}
