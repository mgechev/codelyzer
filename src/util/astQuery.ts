import * as ts from 'typescript';
import { Maybe, ifTrue } from './function';

export function callExpression(dec?: ts.Decorator): Maybe<ts.CallExpression | undefined> {
  return Maybe.lift(dec!.expression).fmap(expr => (ts.isCallExpression(expr!) ? (expr as ts.CallExpression) : undefined));
}

export function isPropertyAssignment(expr: ts.ObjectLiteralElement): expr is ts.PropertyAssignment {
  return expr && expr.kind === ts.SyntaxKind.PropertyAssignment;
}

export function isSimpleTemplateString(expr: ts.Expression): expr is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral {
  return (expr && expr.kind === ts.SyntaxKind.StringLiteral) || expr.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral;
}

export function hasProperties(expr?: ts.ObjectLiteralExpression): boolean {
  return !!(expr && expr.properties);
}

export function objectLiteralExpression(expr?: ts.CallExpression): Maybe<ts.ObjectLiteralExpression | undefined> {
  return Maybe.lift(expr!.arguments[0]).fmap(
    arg0 => (ts.isObjectLiteralExpression(arg0!) ? (arg0 as ts.ObjectLiteralExpression) : undefined)
  );
}

export function withIdentifier(identifier: string): (expr: ts.CallExpression) => Maybe<ts.CallExpression | undefined> {
  return ifTrue(expr => ts.isIdentifier(expr.expression) && expr.expression.text === identifier);
}

export type WithStringInitializer = ts.StringLiteral | ts.NoSubstitutionTemplateLiteral;

export function isProperty(propName: string, p: ts.ObjectLiteralElement): boolean {
  return isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === propName;
}

export function getInitializer(p: ts.ObjectLiteralElement): Maybe<ts.Expression | undefined> {
  return Maybe.lift(isPropertyAssignment(p) && ts.isIdentifier(p.name) ? p.initializer : undefined);
}

export function getStringInitializerFromProperty(
  propertyName: string,
  ps: ts.NodeArray<ts.ObjectLiteralElement>
): Maybe<WithStringInitializer | undefined> {
  const property = ps.find(p => isProperty(propertyName, p))!;

  return (
    getInitializer(property)
      // A little wrinkle to return Maybe<WithStringInitializer>
      .fmap(expr => (isSimpleTemplateString(expr!) ? (expr as WithStringInitializer) : undefined))
  );
}

export function decoratorArgument(dec: ts.Decorator): Maybe<ts.ObjectLiteralExpression | undefined> {
  return Maybe.lift(dec)
    .bind(callExpression)
    .bind(objectLiteralExpression);
}
