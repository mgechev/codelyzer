import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'no-output-on-prefix',
    type: 'maintainability',
    description: 'Name events without the prefix on',
    descriptionDetails: `See more at https://angular.io/guide/styleguide#dont-prefix-output-properties`,
    rationale: `Angular allows for an alternative syntax on-*. If the event itself was prefixed with on
     this would result in an on-onEvent binding expression`,
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
  };

  static FAILURE_STRING: string = 'In the class "%s", the output ' +
    'property "%s" should not be prefixed with on';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new OutputWalker(sourceFile,
        this.getOptions()));
  }
}

class OutputWalker extends NgWalker {
  visitNgOutput(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {
    const className = (<any>property).parent.name.text;
    const memberName = (<any>property.name).text;

    if (memberName && memberName.startsWith('on')) {
      const failureConfig: string[] = [Rule.FAILURE_STRING, className, memberName];
      const errorMessage = sprintf.apply(null, failureConfig);
      this.addFailure(
        this.createFailure(
          property.getStart(),
          property.getWidth(),
          errorMessage
        )
      );
    }
  }
}
