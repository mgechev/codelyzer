import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { DirectiveMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';
import { getClassName, kebabToCamelCase, toTitleCase } from './util/utils';

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Disallows renaming directive inputs by providing a string to the decorator.',
    descriptionDetails: 'See more at https://angular.io/styleguide#style-05-13.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Two names for the same property (one private, one public) is inherently confusing.',
    ruleName: 'no-input-rename',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = Lint.Utils.dedent`
    In the class "%s", the directive input property "%s" should not be renamed.
    However, you should use an alias when the directive name is also an input property, and the directive name
    doesn't describe the property. In this last case, you can disable this rule with \`tslint:disable-next-line:no-input-rename\`.
  `;

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new InputMetadataWalker(sourceFile, this.getOptions()));
  }
}

export const getFailureMessage = (className: string, propertyName: string): string => {
  return sprintf(Rule.FAILURE_STRING, className, propertyName);
};

// source: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques
const whiteListAliases = new Set<string>([
  'aria-activedescendant',
  'aria-atomic',
  'aria-autocomplete',
  'aria-busy',
  'aria-checked',
  'aria-controls',
  'aria-current',
  'aria-describedby',
  'aria-disabled',
  'aria-dragged',
  'aria-dropeffect',
  'aria-expanded',
  'aria-flowto',
  'aria-haspopup',
  'aria-hidden',
  'aria-invalid',
  'aria-label',
  'aria-labelledby',
  'aria-level',
  'aria-live',
  'aria-multiline',
  'aria-multiselectable',
  'aria-orientation',
  'aria-owns',
  'aria-posinset',
  'aria-pressed',
  'aria-readonly',
  'aria-relevant',
  'aria-required',
  'aria-selected',
  'aria-setsize',
  'aria-sort',
  'aria-valuemax',
  'aria-valuemin',
  'aria-valuenow',
  'aria-valuetext'
]);

export class InputMetadataWalker extends NgWalker {
  private directiveSelectors!: ReadonlyArray<DirectiveMetadata['selector']>;

  protected visitNgDirective(metadata: DirectiveMetadata): void {
    this.directiveSelectors = Array.from(new Set((metadata.selector || '').replace(/[\[\]\s]/g, '').split(',')));
    super.visitNgDirective(metadata);
  }

  protected visitNgInput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    this.validateInput(property, args);
    super.visitNgInput(property, input, args);
  }

  private canPropertyBeAliased(propertyAlias: string, propertyName: string): boolean {
    return !!(
      (propertyAlias !== propertyName &&
        this.directiveSelectors &&
        this.directiveSelectors.some(x => new RegExp(`^${x}((${toTitleCase(propertyName)}$)|(?=$))`).test(propertyAlias))) ||
      (whiteListAliases.has(propertyAlias) && propertyName === kebabToCamelCase(propertyAlias))
    );
  }

  private validateInput(property: ts.PropertyDeclaration, args: string[]) {
    const className = getClassName(property)!;
    const memberName = property.name.getText();

    if (args.length === 0 || this.canPropertyBeAliased(args[0], memberName)) {
      return;
    }

    this.addFailureAtNode(property, getFailureMessage(className, memberName));
  }
}
