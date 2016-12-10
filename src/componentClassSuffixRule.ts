import * as Lint from 'tslint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import {Ng2Walker} from './angular/ng2Walker';
import {ComponentMetadata} from './angular/metadata';

export class Rule extends Lint.Rules.AbstractRule {
  static FAILURE: string = 'The name of the class %s should end with the suffix %s ($$02-03$$)';

  static validate(className: string, suffix: string):boolean {
    return className.endsWith(suffix);
  }

  public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
    return this.applyWithWalker(
      new ClassMetadataWalker(sourceFile,
        this.getOptions()));
  }
}

export class ClassMetadataWalker extends Ng2Walker {
  visitNg2Component(meta: ComponentMetadata) {
    let name = meta.controller.name;
    let className: string = name.text;
    const suffix = this.getOptions()[0] || 'Component';
    if (!Rule.validate(className, suffix)) {
      this.addFailure(
        this.createFailure(
          name.getStart(),
          name.getWidth(),
          sprintf.apply(this, [Rule.FAILURE, className, suffix])));
    }
    super.visitNg2Component(meta);
  }
}
