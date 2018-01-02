import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
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
    typescriptOnly: true,
  };

  static FAILURE_STRING: string = 'In the class "%s", the directive ' +
    'input property "%s" should not be renamed.' +
    'Please, consider the following use "@Input() %s: string"';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new InputMetadataWalker(sourceFile,
        this.getOptions()));
  }
}

export class InputMetadataWalker extends NgWalker {
  visitNgInput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    let className = (<any>property).parent.name.text;
    let memberName = (<any>property.name).text;
    if (args.length !== 0 && memberName !== args[0]) {
      let failureConfig: string[] = [className, memberName, memberName];
      failureConfig.unshift(Rule.FAILURE_STRING);
      this.addFailure(
        this.createFailure(
          property.getStart(),
          property.getWidth(),
          sprintf.apply(this, failureConfig)));
    }
  }
}
