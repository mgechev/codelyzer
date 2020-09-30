import * as Lint from 'tslint';
import * as ts from 'typescript';
import * as e from '@angular/compiler/src/expression_parser/ast';

import { SourceMappingVisitor } from '../sourceMappingVisitor';
import { ComponentMetadata } from '../metadata';

export interface FlatSymbolTable {
  [identifier: string]: boolean;
}

export class RecursiveAngularExpressionVisitor extends SourceMappingVisitor implements e.AstVisitor {
  public preDefinedVariables: FlatSymbolTable = {};

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions, protected context: ComponentMetadata, protected basePosition: number) {
    super(sourceFile, options, context.template!.template, basePosition);
  }

  visit(ast: e.AST, context: any) {
    ast.visit(this, context);
    return null;
  }

  visitNonNullAssert(ast: e.NonNullAssert, context: any) {
    ast.visit(this, context);
    return null;
  }

  visitBinary(ast: e.Binary, context: any): any {
    ast.left.visit(this, context);
    ast.right.visit(this, context);
    return null;
  }

  visitChain(ast: e.Chain, context: any): any {
    return this.visitAll(ast.expressions, context);
  }

  visitConditional(ast: e.Conditional, context: any): any {
    ast.condition.visit(this, context);
    ast.trueExp.visit(this, context);
    ast.falseExp.visit(this, context);
    return null;
  }

  visitPipe(ast: e.BindingPipe, context: any): any {
    ast.exp.visit(this, context);
    this.visitAll(ast.args, context);
    return null;
  }

  visitFunctionCall(ast: e.FunctionCall, context: any): any {
    ast.target!.visit(this, context);
    this.visitAll(ast.args, context);
    return null;
  }

  visitImplicitReceiver(ast: e.ImplicitReceiver, context: any): any {
    return null;
  }

  visitInterpolation(ast: e.Interpolation, context: any): any {
    ast.expressions.forEach((e: any, i: number) => this.visit(e, context));
    return null;
  }

  visitKeyedRead(ast: e.KeyedRead, context: any): any {
    ast.obj.visit(this, context);
    ast.key.visit(this, context);
    return null;
  }

  visitKeyedWrite(ast: e.KeyedWrite, context: any): any {
    ast.obj.visit(this, context);
    ast.key.visit(this, context);
    ast.value.visit(this, context);
    return null;
  }

  visitLiteralArray(ast: e.LiteralArray, context: any): any {
    return this.visitAll(ast.expressions, context);
  }

  visitLiteralMap(ast: e.LiteralMap, context: any): any {
    return this.visitAll(ast.values, context);
  }

  visitLiteralPrimitive(ast: e.LiteralPrimitive, context: any): any {
    return null;
  }

  visitMethodCall(ast: e.MethodCall, context: any): any {
    ast.receiver.visit(this, context);
    return this.visitAll(ast.args, context);
  }

  visitPrefixNot(ast: e.PrefixNot, context: any): any {
    ast.expression.visit(this, context);
    return null;
  }

  visitPropertyRead(ast: e.PropertyRead, context: any): any {
    ast.receiver.visit(this, context);
    return null;
  }

  visitPropertyWrite(ast: e.PropertyWrite, context: any): any {
    ast.receiver.visit(this, context);
    ast.value.visit(this, context);
    return null;
  }

  visitSafePropertyRead(ast: e.SafePropertyRead, context: any): any {
    ast.receiver.visit(this, context);
    return null;
  }

  visitSafeMethodCall(ast: e.SafeMethodCall, context: any): any {
    ast.receiver.visit(this, context);
    return this.visitAll(ast.args, context);
  }

  visitAll(asts: e.AST[], context: any): any {
    asts.forEach((ast) => ast.visit(this, context));
    return null;
  }

  visitQuote(ast: e.Quote, context: any): any {
    return null;
  }
}
