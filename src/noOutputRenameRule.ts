import { IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { Decorator, PropertyDeclaration, SourceFile } from 'typescript/lib/typescript';
import { DirectiveMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Disallows renaming directive outputs by providing a string to the decorator.',
    descriptionDetails: 'See more at https://angular.io/styleguide#style-05-13.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Two names for the same property (one private, one public) is inherently confusing.',
    ruleName: 'no-output-rename',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = '@Outputs should not be renamed';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

export const getFailureMessage = (): string => {
  return Rule.FAILURE_STRING;
};

class Walker extends NgWalker {
  private directiveSelectors!: ReadonlySet<DirectiveMetadata['selector']>;

  protected visitNgDirective(metadata: DirectiveMetadata): void {
    this.directiveSelectors = new Set((metadata.selector || '').replace(/[\[\]\s]/g, '').split(','));
    super.visitNgDirective(metadata);
  }

  protected visitNgOutput(property: PropertyDeclaration, output: Decorator, args: string[]) {
    this.validateOutput(property, output, args);
    super.visitNgOutput(property, output, args);
  }

  private canPropertyBeAliased(propertyAlias: string, propertyName: string): boolean {
    return !!(this.directiveSelectors && this.directiveSelectors.has(propertyAlias) && propertyAlias !== propertyName);
  }

  private validateOutput(property: PropertyDeclaration, output: Decorator, args: string[]) {
    const propertyName = property.name.getText();

    if (args.length === 0 || this.canPropertyBeAliased(args[0], propertyName)) {
      return;
    }

    this.addFailureAtNode(property, getFailureMessage());
  }
}
