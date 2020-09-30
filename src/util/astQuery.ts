import * as ts from 'typescript';
import { Maybe, ifTrue } from './function';
import { isStringLiteralLike } from './utils';

export function callExpression(dec?: ts.Decorator): Maybe<ts.CallExpression | undefined> {
  return Maybe.lift(dec!.expression).fmap((expr) => (expr && ts.isCallExpression(expr) ? expr : undefined));
}

export function hasProperties(expr?: ts.ObjectLiteralExpression): boolean {
  return !!(expr && expr.properties);
}

export function objectLiteralExpression(expr?: ts.CallExpression): Maybe<ts.ObjectLiteralExpression | undefined> {
  return Maybe.lift(expr!.arguments[0]).fmap((arg0) => (arg0 && ts.isObjectLiteralExpression(arg0) ? arg0 : undefined));
}

export function withIdentifier(identifier: string): (expr: ts.CallExpression) => Maybe<ts.CallExpression | undefined> {
  return ifTrue((expr) => ts.isIdentifier(expr.expression) && expr.expression.text === identifier);
}

export function isProperty(propName: string, p: ts.ObjectLiteralElement): boolean {
  return ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === propName;
}

export function getInitializer(p: ts.ObjectLiteralElement): Maybe<ts.Expression | undefined> {
  return Maybe.lift(p && ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) ? p.initializer : undefined);
}

export function getStringInitializerFromProperty(
  propertyName: string,
  ps: ts.NodeArray<ts.ObjectLiteralElement>
): Maybe<ts.StringLiteral | undefined> {
  const property = ps.find((p) => isProperty(propertyName, p))!;

  return (
    getInitializer(property)
      // A little wrinkle to return Maybe<ts.StringLiteral>
      .fmap((expr) => (expr && isStringLiteralLike(expr) ? (expr as ts.StringLiteral) : undefined))
  );
}

export function decoratorArgument(dec: ts.Decorator): Maybe<ts.ObjectLiteralExpression | undefined> {
  return Maybe.lift(dec).bind(callExpression).bind(objectLiteralExpression);
}
