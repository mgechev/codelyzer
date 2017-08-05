import { getComponentDecorator, getDecoratorPropertyInitializer } from './util/utils';
import * as Lint from 'tslint';
import * as ts from 'typescript';

import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {

  static metadata: Lint.IRuleMetadata = {
    ruleName: 'use-view-encapsulation',
    type: 'maintainability',
    description: 'Disallows using of ViewEncapsulation.None',
    rationale: '',
    options: null,
    optionsDescription: 'Not configurable',
    typescriptOnly: true
  };

  static FAILURE = 'Using "ViewEncapsulation.None" will make your styles global which may have unintended effect';

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new ViewEncapsulationWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

class ViewEncapsulationWalker extends NgWalker {

  visitClassDeclaration(node: ts.ClassDeclaration) {
    const decorator = getComponentDecorator(node);

    if (!decorator) {
      return;
    }
    const encapsulation = getDecoratorPropertyInitializer(decorator, 'encapsulation');

    if (!encapsulation ||
      encapsulation.name.text !== 'None') {
      return;
    }

    this.addFailure(
      this.createFailure(
        encapsulation.getStart(),
        encapsulation.getWidth(),
        Rule.FAILURE
      )
    );
  }
}
