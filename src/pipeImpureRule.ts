import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import SyntaxKind = require('./util/syntax-kind');

export class Rule extends Lint.Rules.AbstractRule {

  public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
    return this.applyWithWalker(
      new ClassMetadataWalker(sourceFile, this));
  }

  static  FAILURE:string = 'Warning: impure pipe declared in class %s.';
}

export class ClassMetadataWalker extends Lint.RuleWalker {

  constructor(sourceFile:ts.SourceFile, private rule:Rule) {
    super(sourceFile, rule.getOptions());
  }

  visitClassDeclaration(node:ts.ClassDeclaration) {
    let className = node.name.text;
    let decorators = node.decorators || [];
    decorators.filter(d=> {
      let baseExpr = <any>d.expression || {};
      return baseExpr.expression.text === 'Pipe'
    }).forEach(this.validateProperties.bind(this, className));
    super.visitClassDeclaration(node);
  }

  private validateProperties(className:string, pipe:any) {
    let argument = this.extractArgument(pipe);
    if (argument.kind === SyntaxKind.current().ObjectLiteralExpression) {
      argument.properties.filter(n=>n.name.text === 'pure')
      .forEach(this.validateProperty.bind(this, className))
    }
  }

  private extractArgument(pipe:any) {
    let baseExpr = <any>pipe.expression || {};
    let args = baseExpr.arguments || [];
    return args[0];
  }

  private validateProperty(className:string, property:any) {
    let propValue:string = property.initializer.getText();
    if (propValue === "false") {
      this.addFailure(
        this.createFailure(
          property.getStart(),
          property.getWidth(),
          sprintf.apply(this, this.createFailureArray(className))));
    }
  }

  private createFailureArray(className:string):Array<string> {
    return [Rule.FAILURE, className];
  }
}

