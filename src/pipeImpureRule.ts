import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { NgWalker } from './angular/ngWalker';
import { getDecoratorArgument } from './util/utils';

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    ruleName: 'pipe-impure',
    type: 'functionality',
    description: 'Pipes cannot be declared as impure.',
    rationale: 'Impure pipes do not perform well because they run on every change detection cycle.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Warning: impure pipe declared in class %s';

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
  }
}

export class ClassMetadataWalker extends NgWalker {
  protected visitNgPipe(controller: ts.ClassDeclaration, decorator: ts.Decorator) {
    this.validatePipe(controller.name!.text, decorator);
    super.visitNgPipe(controller, decorator);
  }

  private validatePipe(className: string, decorator: ts.Decorator): void {
    const argument = getDecoratorArgument(decorator)!;
    const property = argument.properties.find(p => p.name!.getText() === 'pure');

    if (!property) {
      return;
    }

    const propValue = ts.isPropertyAssignment(property) ? property.initializer.getText() : undefined;

    if (!propValue || propValue !== 'false') {
      return;
    }

    this.addFailureAtNode(property, sprintf(Rule.FAILURE_STRING, className));
  }
}
