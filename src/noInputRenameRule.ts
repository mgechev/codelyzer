import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { DirectiveMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  static metadata: Lint.IRuleMetadata = {
    description: 'Disallows renaming directive inputs by providing a string to the decorator.',
    descriptionDetails: 'See more at https://angular.io/styleguide#style-05-13.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Two names for the same property (one private, one public) is inherently confusing.',
    ruleName: 'no-input-rename',
    type: 'maintainability',
    typescriptOnly: true
  };

  static FAILURE_STRING = 'In the class "%s", the directive input property "%s" should not be renamed. ' +
  'However, you should use an alias when the directive name is also an input property, and the directive name' +
  " doesn't describe the property. In this last case, you can disable this rule with `tslint:disable-next-line:no-input-rename`.";

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new InputMetadataWalker(sourceFile, this.getOptions()));
  }
}

export class InputMetadataWalker extends NgWalker {
  private directiveSelector: DirectiveMetadata['selector'][];

  visitNgDirective(metadata: DirectiveMetadata): void {
    this.directiveSelector = (metadata.selector || '').replace(/[\[\]\s]/g, '').split(',');
  }

  visitNgInput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    const className = (property.parent as ts.PropertyAccessExpression).name.getText();
    const memberName = property.name.getText();

    if (
      args.length === 0 ||
      (this.directiveSelector &&
        (input.expression as any).arguments.some(arg => this.directiveSelector.indexOf(arg.text) !== -1 && memberName !== arg.text))
    ) {
      return;
    }

    this.addFailureAtNode(property, sprintf(Rule.FAILURE_STRING, className, memberName));
  }
}
