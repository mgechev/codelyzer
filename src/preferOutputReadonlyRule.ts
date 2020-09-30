import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { Decorator, PropertyDeclaration, SourceFile, SyntaxKind } from 'typescript/lib/typescript';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Prefer to declare `@Output` as readonly since they are not supposed to be reassigned.',
    options: null,
    optionsDescription: 'Not configurable.',
    ruleName: 'prefer-output-readonly',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'Prefer to declare `@Output` as readonly since they are not supposed to be reassigned';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  protected visitNgOutput(property: PropertyDeclaration, output: Decorator, args: string[]) {
    this.validateOutput(property);
    super.visitNgOutput(property, output, args);
  }

  private validateOutput(property: PropertyDeclaration) {
    if (property.modifiers && property.modifiers.some((m) => m.kind === SyntaxKind.ReadonlyKeyword)) {
      return;
    }

    this.addFailureAtNode(property.name, Rule.FAILURE_STRING);
  }
}
