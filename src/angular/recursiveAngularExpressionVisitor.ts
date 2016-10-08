import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import * as e from '@angular/compiler/src/expression_parser/ast';
import { INTERPOLATION } from './config';

const escapeString = require('escape-string-regexp');

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
    let oldDisplacement = this.basePosition;
    // Note that we add the expression property in ng2Walker.
    // This is due an issue in the ParseSpan in the child expressions
    // of the interpolation AST.
    const regexp = new RegExp(escapeString(INTERPOLATION[0]) + '|' + escapeString(INTERPOLATION[1]), 'g');
    const parts: string[] = (<any>ast).interpolateExpression.split(regexp).map((s: string) => {
      return s.replace(INTERPOLATION[1], '');
    }).filter((e: string, i: number) => (i % 2));
    ast.expressions.forEach((e: any, i: number) => {
      // for {{
      this.basePosition += ast.strings[i].length + 2;
      this.visit(e, context);
      // for }}
      this.basePosition += 2 + parts[i].length;
    });
    this.basePosition = oldDisplacement;
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

