import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'no-input-prefix',
    type: 'maintainability',
    description: 'Input names should not be prefixed with the configured disallowed prefixes.',
    rationale: `HTML attributes are not prefixed. It's considered best not to prefix Inputs.
    * Example: 'enabled' is prefered over 'isEnabled'.
    `,
    options: {
      'type': 'array',
      'items': [
        { 'type': 'string' }
      ],
    },
    optionExamples: [
      '["is", "can", "should"]'
    ],
    optionsDescription: 'Options accept a string array of disallowed input prefixes.',
    typescriptOnly: true
  };

  static FAILURE_STRING: string = 'In the class "%s", the input property "%s" should not be prefixed with %s';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new InputWalker(sourceFile, this.getOptions()));
  }
}

class InputWalker extends NgWalker {
  visitNgInput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    const className = (<any>property).parent.name.text;
    const memberName = (<any>property.name).text as string;
    const options = this.getOptions() as string[];
    let prefixLength: number;

    if (memberName) {
      const foundInvalid = options.find(x => memberName.startsWith(x));
      prefixLength = foundInvalid ? foundInvalid.length : 0;
    }

    if (
      prefixLength > 0 &&
      !(memberName.length >= prefixLength + 1 && memberName[prefixLength] !== memberName[prefixLength].toUpperCase())
    ) {
      const failureConfig: string[] = [Rule.FAILURE_STRING, className, memberName, options.join(', ')];
      const errorMessage = sprintf.apply(null, failureConfig);
      this.addFailure(this.createFailure(property.getStart(), property.getWidth(), errorMessage));
    }
  }
}
