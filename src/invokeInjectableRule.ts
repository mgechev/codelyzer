import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'invoke-injectable',
    type: 'functionality',
    description: `Ensures that @Injectable decorator is properly invoked.`,
    rationale: `Application will fail mysteriously if we forget the parentheses.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };


  static FAILURE_STRING: string = 'You have to invoke @Injectable()';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new ValidateInjectableWalker(sourceFile,
        this.getOptions()));
  }
}

export class ValidateInjectableWalker extends NgWalker {
  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    (<ts.Decorator[]>declaration.decorators || [])
      .forEach((d: any) => {
        // This means that "Injectable" is used as Identifier,
        // not as a call expression.
        if (d.expression && d.expression.text === 'Injectable') {
          this.addFailure(this.createFailure(d.getStart(), d.getWidth(), Rule.FAILURE_STRING));
        }
      });
  }
}
