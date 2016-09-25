import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import {Ng2Walker} from './angular/ng2Walker';

export class Rule extends Lint.Rules.AbstractRule {
  static FAILURE_STRING: string = 'You have to invoke @Injectable()';

  public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
    return this.applyWithWalker(
      new ValidateInjectableWalker(sourceFile,
        this.getOptions()));
  }
}

export class ValidateInjectableWalker extends Ng2Walker {
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
