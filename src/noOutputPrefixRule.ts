import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  static metadata: Lint.IRuleMetadata = {
    description: 'Disallows output names to be prefixed with a configured pattern.',
    descriptionDetails: 'See more at https://angular.io/guide/styleguide#style-05-16.',
    optionExamples: ['"^on"', '"^(on|yes)[A-Z]+"'],
    options: {
      type: 'array',
      items: [{ type: 'string' }]
    },
    optionsDescription: 'Options accept a string defining ignore pattern for this rule, being parsed by new RegExp().',
    rationale: `It's considered best not to prefix @Outputs.
      * Example: 'savedTheDay' is prefered over 'onSavedTheDay'.
    `,
    ruleName: 'no-output-prefix',
    type: 'maintainability',
    typescriptOnly: true
  };

  static FAILURE_STRING = 'The output property "%s" should not match the prefix pattern %s';

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new OutputWalker(sourceFile, this.getOptions()));
  }
}

class OutputWalker extends NgWalker {
  visitNgOutput(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {
    this.validatePrefix(property, output, args);
    super.visitNgOutput(property, output, args);
  }

  private validatePrefix(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]): void {
    const memberName = property.name.getText();
    const str: string = this.getOptions()[1];

    if (!str || !str.trim() || !new RegExp(str).test(memberName)) {
      return;
    }

    const failureConfig = [Rule.FAILURE_STRING, memberName, str];
    this.addFailureAtNode(property, sprintf.apply(this, failureConfig));
  }
}
