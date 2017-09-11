import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { NgWalker } from './angular/ngWalker';

import { DirectiveMetadata } from './angular/metadata';

const getInterfaceName = (t: any): string => {
  if (!t.expression) {
    return '';
  }
  if (t.expression.name) {
    return t.expression.name.text;
  }
  return t.expression.text;
};

const ValidatorSuffix = 'Validator';

export class Rule extends Lint.Rules.AbstractRule {

  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'directive-class-suffix',
    type: 'style',
    description: `Classes decorated with @Directive must have suffix "Directive" (or custom) in their name.`,
    descriptionDetails: `See more at https://angular.io/styleguide#style-02-03.`,
    rationale: `Consistent conventions make it easy to quickly identify and reference assets of different types.`,
    options: {
      type: 'array',
      items: {
        type: 'string',
      }
    },
    optionExamples: [
      `true`,
      `[true, "Directive", "MySuffix"]`,
    ],
    optionsDescription: `Supply a list of allowed component suffixes. Defaults to "Directive".`,
    typescriptOnly: true,
  };

  static FAILURE: string = 'The name of the class %s should end with the suffix %s (https://angular.io/styleguide#style-02-03)';

  static validate(className: string, suffixes: string[]): boolean {
    return suffixes.some(s => className.endsWith(s));
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new ClassMetadataWalker(sourceFile,
        this.getOptions()));
  }
}

export class ClassMetadataWalker extends NgWalker {
  visitNgDirective(meta: DirectiveMetadata) {
    let name = meta.controller.name;
    let className: string = name.text;
    const options = this.getOptions();
    const suffixes: string[] = options.length ? options : ['Directive'];
    const heritageClauses = meta.controller.heritageClauses;
    if (heritageClauses) {
      const i = heritageClauses.filter(h => h.token === ts.SyntaxKind.ImplementsKeyword);
      if (i.length !== 0 &&
          i[0].types.map(getInterfaceName)
            .filter(name => !!name)
            .some(name => name.endsWith(ValidatorSuffix))) {
        suffixes.push(ValidatorSuffix);
      }
    }
    if (!Rule.validate(className, suffixes)) {
      this.addFailure(
        this.createFailure(
          name.getStart(),
          name.getWidth(),
          sprintf.apply(this, [Rule.FAILURE, className, suffixes.join(', ')])));
    }
  }
}
