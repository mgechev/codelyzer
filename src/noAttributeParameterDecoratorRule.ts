import * as Lint from 'tslint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import SyntaxKind = require('./util/syntaxKind');

export class Rule extends Lint.Rules.AbstractRule {
  static  FAILURE_STRING:string = 'In the constructor of class "%s",' +
    ' the parameter "%s" uses the @Attribute decorator, ' +
    'which is considered as a bad practice. Please,' +
    ' consider construction of type "@Input() %s: string"';

  public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
    return this.applyWithWalker(
      new ConstructorMetadataWalker(sourceFile,
        this.getOptions()));
  }
}

export class ConstructorMetadataWalker extends Lint.RuleWalker {
  visitConstructorDeclaration(node:ts.ConstructorDeclaration) {
    let syntaxKind = SyntaxKind.current();
    let parentName: string = '';
    let parent = (<any>node.parent);
    if (parent.kind === syntaxKind.ClassExpression) {
      parentName= parent.parent.name.text;
    } else if (parent.kind = syntaxKind.ClassDeclaration) {
      parentName= parent.name.text;
    }
    (<any[]>node.parameters || []).forEach(this.validateParameter.bind(this, parentName));
    super.visitConstructorDeclaration(node);
  }

  validateParameter(className: string, parameter) {
    let parameterName = (<ts.Identifier>parameter.name).text;
    if (parameter.decorators) {
      parameter.decorators.forEach((decorator)=> {
        let baseExpr = <any>decorator.expression || {};
        let expr = baseExpr.expression || {};
        let name = expr.text;
        if (name === 'Attribute') {
          let failureConfig:string[] = [className, parameterName, parameterName];
          failureConfig.unshift(Rule.FAILURE_STRING);
          this.addFailure(
            this.createFailure(
              parameter.getStart(),
              parameter.getWidth(),
              sprintf.apply(this, failureConfig)));
        }
      });
    }
  }
}
