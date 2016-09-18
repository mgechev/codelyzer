import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import SyntaxKind = require('./util/syntax-kind');
import {Ng2Walker} from './angular/ng2-walker';

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
    return this.applyWithWalker(
      new ClassMetadataWalker(sourceFile,
        this.getOptions()));
  }

  static FAILURE:string = "The name of the class %s should end with the suffix Component ($$02-03$$)";

  static validate(className:string):boolean {
    return /.*Component$/.test(className);
  }
}

export class ClassMetadataWalker extends Ng2Walker {
  visitNg2Component(controller:ts.ClassDeclaration, decorator:ts.Decorator) {
    let name = controller.name;
    let className:string = name.text;
    if (!Rule.validate(className)) {
      this.addFailure(
        this.createFailure(
          name.getStart(),
          name.getWidth(),
          sprintf.apply(this, [Rule.FAILURE, className])));
    }
  }
}
