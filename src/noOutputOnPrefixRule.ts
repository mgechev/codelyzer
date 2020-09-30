import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { getClassName } from './util/utils';

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Name events without the prefix on.',
    descriptionDetails: 'See more at https://angular.io/guide/styleguide#dont-prefix-output-properties.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale:
      'Angular allows for an alternative syntax on-*. If the event itself was prefixed with on this would result in an on-onEvent binding expression.',
    ruleName: 'no-output-on-prefix',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'In the class "%s", the output property "%s" should not be prefixed with on';

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  protected visitNgOutput(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {
    this.validateOutput(property);
    super.visitNgOutput(property, output, args);
  }

  private validateOutput(property: ts.PropertyDeclaration): void {
    const className = getClassName(property);
    const memberName = property.name.getText();

    if (!memberName || !/^on((?![a-z])|(?=$))/.test(memberName)) {
      return;
    }

    const failure = sprintf(Rule.FAILURE_STRING, className, memberName);

    this.addFailureAtNode(property, failure);
  }
}
