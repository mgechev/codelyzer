import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { ClassDeclaration, Decorator, SourceFile, SyntaxKind } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { getClassName, getDecoratorPropertyInitializer } from './util/utils';

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
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Impure pipe declared in class %s';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
  }
}

export class ClassMetadataWalker extends NgWalker {
  protected visitNgPipe(controller: ClassDeclaration, decorator: Decorator): void {
    this.validatePipe(controller, decorator);
    super.visitNgPipe(controller, decorator);
  }

  private validatePipe(controller: ClassDeclaration, decorator: Decorator): void {
    const pureExpression = getDecoratorPropertyInitializer(decorator, 'pure');

    if (!pureExpression) return;

    const { parent: parentExpression } = pureExpression;
    const isNotFalseLiteral = pureExpression.kind !== SyntaxKind.FalseKeyword;

    if (!parentExpression || isNotFalseLiteral) return;

    const className = getClassName(controller);

    if (!className) return;

    const failure = getFailureMessage({ className });

    this.addFailureAtNode(parentExpression, failure);
  }
}
