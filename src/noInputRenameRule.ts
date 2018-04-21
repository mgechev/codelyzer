import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { DirectiveMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'no-input-rename',
    type: 'maintainability',
    description: 'Disallows renaming directive inputs by providing a string to the decorator.',
    descriptionDetails: 'See more at https://angular.io/styleguide#style-05-13.',
    rationale: 'Two names for the same property (one private, one public) is inherently confusing.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true
  };

  static FAILURE_STRING: string = 'In the class "%s", the directive input property "%s" should not be renamed.';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new InputMetadataWalker(sourceFile, this.getOptions()));
  }
}

export class InputMetadataWalker extends NgWalker {
  private directiveSelector: DirectiveMetadata['selector'][];

  visitNgDirective(metadata: DirectiveMetadata): void {
    this.directiveSelector = (metadata.selector || '').replace(/[\[\]\s]/g, '').split(',');
  }

  visitNgInput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    const className = (property.parent as any).name.text;
    const memberName = (property.name as any).text;

    if (args.length === 0 || (this.directiveSelector && this.directiveSelector.indexOf(memberName) !== -1)) {
      return;
    }

    const failureConfig = [Rule.FAILURE_STRING, className, memberName];
    this.addFailureAtNode(property, sprintf.apply(this, failureConfig));
  }
}
