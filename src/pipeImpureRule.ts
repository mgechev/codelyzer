import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'pipe-impure',
    type: 'functionality',
    description: 'Pipes cannot be declared as impure.',
    rationale: 'Impure pipes do not perform well because they run on every change detection cycle.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true
  };

  static FAILURE = 'Warning: impure pipe declared in class %s';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
  }
}

export class ClassMetadataWalker extends NgWalker {
  protected visitNgPipe(controller: ts.ClassDeclaration, decorator: ts.Decorator) {
    this.validateProperties(controller.name!.text, decorator);
    super.visitNgPipe(controller, decorator);
  }

  private validateProperties(className: string, pipe: any) {
    let argument = this.extractArgument(pipe);
    if (argument.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      argument.properties.filter(n => n.name.text === 'pure').forEach(this.validateProperty.bind(this, className));
    }
  }

  private extractArgument(pipe: any) {
    let baseExpr = <any>pipe.expression || {};
    let args = baseExpr.arguments || [];
    return args[0];
  }

  private validateProperty(className: string, property: any) {
    const propValue = property.initializer.getText();
    if (propValue === 'false') {
      this.addFailureAtNode(property, sprintf(Rule.FAILURE, className));
    }
  }
}
