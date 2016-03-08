import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';

const getDecoratorName = (decorator: ts.Decorator) => {
  let baseExpr = <any>decorator.expression || {};
  let expr = baseExpr.expression || {};
  return expr.text;
};

const getDecoratorStringArgs = (decorator: ts.Decorator) => {
  let baseExpr = <any>decorator.expression || {};
  let expr = baseExpr.expression || {};
  let args = baseExpr.arguments || [];
  return args.map(a => (a.kind === ts.SyntaxKind.StringLiteral) ? a.text : null);
};

export class Ng2Walker extends Lint.RuleWalker {
  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    (declaration.decorators || []).forEach(this.visitClassDecorator.bind(this));
    super.visitClassDeclaration(declaration);
  }
  visitMethodDeclaration(method: ts.MethodDeclaration) {
    (method.decorators || []).forEach(this.visitMethodDecorator.bind(this));
    super.visitMethodDeclaration(method);
  }
  protected visitMethodDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);
    if (name === 'HostListener') {
      this.visitNg2HostListener(<ts.MethodDeclaration>decorator.parent, decorator, getDecoratorStringArgs(decorator));
    }
  }
  visitPropertyDeclaration(prop: ts.PropertyDeclaration) {
    (prop.decorators || []).forEach(this.visitPropertyDecorator.bind(this));
    super.visitPropertyDeclaration(prop);
  }
  protected visitPropertyDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);
    switch (name) {
      case 'Input':
      this.visitNg2Input(<ts.PropertyDeclaration>decorator.parent, decorator, getDecoratorStringArgs(decorator));
      break;
      case 'Output':
      this.visitNg2Output(<ts.PropertyDeclaration>decorator.parent, decorator, getDecoratorStringArgs(decorator));
      break;
      case 'HostBinding':
      this.visitNg2HostBinding(<ts.PropertyDeclaration>decorator.parent, decorator, getDecoratorStringArgs(decorator));
      break;
    }
  }
  protected visitClassDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);
    if (name === 'Component') {
      this.visitNg2Component(<ts.ClassDeclaration>decorator.parent, decorator);
    } else if (name === 'Directive') {
      this.visitNg2Directive(<ts.ClassDeclaration>decorator.parent, decorator);
    }
  }
  protected visitNg2Component(controller: ts.ClassDeclaration, decorator: ts.Decorator) {}
  protected visitNg2Directive(controller: ts.ClassDeclaration, decorator: ts.Decorator) {}
  protected visitNg2Input(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {}
  protected visitNg2Output(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {}
  protected visitNg2HostBinding(property: ts.PropertyDeclaration, decorator: ts.Decorator, args: string[]) {}
  protected visitNg2HostListener(method: ts.MethodDeclaration, decorator: ts.Decorator, args: string[]) {}
}