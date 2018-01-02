import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'no-output-rename',
    type: 'maintainability',
    description: 'Disallows renaming directive outputs by providing a string to the decorator.',
    descriptionDetails: 'See more at https://angular.io/styleguide#style-05-13.',
    rationale: 'Two names for the same property (one private, one public) is inherently confusing.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
  };

  static FAILURE_STRING: string = 'In the class "%s", the directive output ' +
    'property "%s" should not be renamed.' +
    'Please, consider the following use "@Output() %s = new EventEmitter();"';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new OutputMetadataWalker(sourceFile,
        this.getOptions()));
  }
}


export class OutputMetadataWalker extends NgWalker {
  visitNgOutput(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {
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
