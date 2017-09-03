import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { NgWalker } from './angular/ngWalker';
import SyntaxKind = require('./util/syntaxKind');

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'pipe-impure',
    type: 'functionality',
    description: `Pipes cannot be declared as impure.`,
    rationale: `Impure pipes do not perform well because they are run on every change detection cycle.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };


  static FAILURE: string = 'Warning: impure pipe declared in class %s.';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new ClassMetadataWalker(sourceFile, this));
  }
}

export class ClassMetadataWalker extends NgWalker {

  constructor(sourceFile: ts.SourceFile, private rule: Rule) {
    super(sourceFile, rule.getOptions());
  }

  visitNgPipe(controller: ts.ClassDeclaration, decorator: ts.Decorator) {
    this.validateProperties(controller.name.text, decorator);
  }

  private validateProperties(className: string, pipe: any) {
    let argument = this.extractArgument(pipe);
    if (argument.kind === SyntaxKind.current().ObjectLiteralExpression) {
      argument.properties.filter(n => n.name.text === 'pure')
      .forEach(this.validateProperty.bind(this, className));
    }
  }

  private extractArgument(pipe: any) {
    let baseExpr = <any>pipe.expression || {};
    let args = baseExpr.arguments || [];
    return args[0];
  }

  private validateProperty(className: string, property: any) {
    let propValue: string = property.initializer.getText();
    if (propValue === 'false') {
      this.addFailure(
        this.createFailure(
          property.getStart(),
          property.getWidth(),
          sprintf.apply(this, this.createFailureArray(className))));
    }
  }

  private createFailureArray(className: string): Array<string> {
    return [Rule.FAILURE, className];
  }
}
