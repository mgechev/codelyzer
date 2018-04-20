import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    description: 'Prefer to declare `@Output` as readonly since they are not supposed to be reassigned.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: '',
    ruleName: 'prefer-output-readonly',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static FAILURE_STRING = 'Prefer to declare `@Output` as readonly since they are not supposed to be reassigned';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new OutputMetadataWalker(sourceFile, this.getOptions()));
  }
}

export class OutputMetadataWalker extends NgWalker {
  visitNgOutput(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {
    if (property.modifiers && property.modifiers.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword)) {
      return;
    }

    const className = (property.parent as ts.PropertyAccessExpression).name.getText();
    const memberName = property.name.getText();
    this.addFailureAtNode(property.name, Rule.FAILURE_STRING);
    super.visitNgOutput(property, output, args);
  }
}
