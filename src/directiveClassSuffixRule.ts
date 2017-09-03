import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { NgWalker } from './angular/ngWalker';

import { DirectiveMetadata } from './angular/metadata';

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

  static validate(className: string, suffix: string): boolean {
    return className.endsWith(suffix);
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
    const suffix = this.getOptions()[0] || 'Directive';
    if (!Rule.validate(className, suffix)) {
      this.addFailure(
        this.createFailure(
          name.getStart(),
          name.getWidth(),
          sprintf.apply(this, [Rule.FAILURE, className, suffix])));
    }
  }
}
