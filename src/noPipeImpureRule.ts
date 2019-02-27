import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { SourceFile, SyntaxKind } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { getDecoratorPropertyInitializer } from './util/utils';
import { PipeMetadata } from './angular';

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

  static readonly FAILURE_STRING = 'Impure pipes should be avoided';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
  }
}

export class ClassMetadataWalker extends NgWalker {
  protected visitNgPipe(metadata: PipeMetadata): void {
    this.validatePipe(metadata);
    super.visitNgPipe(metadata);
  }

  private validatePipe(metadata: PipeMetadata): void {
    const pureExpression = getDecoratorPropertyInitializer(metadata.decorator, 'pure');

    if (!pureExpression) return;

    const { parent: parentExpression } = pureExpression;
    const isNotFalseLiteral = pureExpression.kind !== SyntaxKind.FalseKeyword;

    if (!parentExpression || isNotFalseLiteral) return;

    this.addFailureAtNode(parentExpression, Rule.FAILURE_STRING);
  }
}
