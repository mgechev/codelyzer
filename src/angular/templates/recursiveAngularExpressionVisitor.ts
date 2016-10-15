import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import * as e from '@angular/compiler/src/expression_parser/ast';

export class RecursiveAngularExpressionVisitor extends Lint.RuleWalker implements e.AstVisitor {
  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions,
      protected context: ts.ClassDeclaration, protected basePosition: number) {
    super(sourceFile, options);
  }

  visit(ast: e.AST, context: any) {
    ast.visit(this);
    return null;
  }

  visitBinary(ast: e.Binary, context: any): any {
    ast.left.visit(this);
    ast.right.visit(this);
    return null;
  }

  visitChain(ast: e.Chain, context: any): any { return this.visitAll(ast.expressions, context); }

  visitConditional(ast: e.Conditional, context: any): any {
    ast.condition.visit(this);
    ast.trueExp.visit(this);
    ast.falseExp.visit(this);
    return null;
  }

  visitPipe(ast: e.BindingPipe, context: any): any {
    ast.exp.visit(this);
    this.visitAll(ast.args, context);
    return null;
  }

  visitFunctionCall(ast: e.FunctionCall, context: any): any {
    ast.target.visit(this);
    this.visitAll(ast.args, context);
    return null;
  }

  visitImplicitReceiver(ast: e.ImplicitReceiver, context: any): any { return null; }

  visitInterpolation(ast: e.Interpolation, context: any): any {
    ast.expressions.forEach((e: any, i: number) => this.visit(e, context));
    return null;
  }

  visitKeyedRead(ast: e.KeyedRead, context: any): any {
    ast.obj.visit(this);
    ast.key.visit(this);
    return null;
  }

  visitKeyedWrite(ast: e.KeyedWrite, context: any): any {
    ast.obj.visit(this);
    ast.key.visit(this);
    ast.value.visit(this);
    return null;
  }

  visitLiteralArray(ast: e.LiteralArray, context: any): any {
    return this.visitAll(ast.expressions, context);
  }

  visitLiteralMap(ast: e.LiteralMap, context: any): any { return this.visitAll(ast.values, context); }

  visitLiteralPrimitive(ast: e.LiteralPrimitive, context: any): any { return null; }

  visitMethodCall(ast: e.MethodCall, context: any): any {
    ast.receiver.visit(this);
    return this.visitAll(ast.args, context);
  }

  visitPrefixNot(ast: e.PrefixNot, context: any): any {
    ast.expression.visit(this);
    return null;
  }

  visitPropertyRead(ast: e.PropertyRead, context: any): any {
    ast.receiver.visit(this);
    return null;
  }

  visitPropertyWrite(ast: e.PropertyWrite, context: any): any {
    ast.receiver.visit(this);
    ast.value.visit(this);
    return null;
  }

  visitSafePropertyRead(ast: e.SafePropertyRead, context: any): any {
    ast.receiver.visit(this);
    return null;
  }

  visitSafeMethodCall(ast: e.SafeMethodCall, context: any): any {
    ast.receiver.visit(this);
    return this.visitAll(ast.args, context);
  }

  visitAll(asts: e.AST[], context: any): any {
    asts.forEach(ast => ast.visit(this, context));
    return null;
  }

  visitQuote(ast: e.Quote, context: any): any { return null; }
}

