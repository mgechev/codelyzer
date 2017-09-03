import * as ts from 'typescript';
import { current } from './syntaxKind';
import { Maybe, ifTrue } from './function';
const kinds = current();

export function isCallExpression(expr: ts.LeftHandSideExpression): expr is ts.CallExpression {
    return expr && expr.kind === kinds.CallExpression;
}

export function callExpression(dec: ts.Decorator): Maybe<ts.CallExpression> {
    return Maybe.lift(dec.expression)
        .fmap(expr => isCallExpression(expr) ? expr as ts.CallExpression : undefined);
}

export function isPropertyAssignment(expr: ts.ObjectLiteralElement): expr is ts.PropertyAssignment {
    return expr && expr.kind === kinds.PropertyAssignment;
}

export function isSimpleTemplateString(expr: ts.Expression): expr is (ts.StringLiteral | ts.NoSubstitutionTemplateLiteral) {
    return expr && expr.kind === kinds.StringLiteral || expr.kind === kinds.NoSubstitutionTemplateLiteral;
}

export function isArrayLiteralExpression(expr: ts.Expression): expr is ts.ArrayLiteralExpression {
    return expr && expr.kind === kinds.ArrayLiteralExpression;
}

export function hasProperties(expr: ts.ObjectLiteralExpression): boolean {
    return expr && !!expr.properties;
}

export function isObjectLiteralExpression(expr: ts.Expression): expr is ts.ObjectLiteralExpression {
    return expr && expr.kind === kinds.ObjectLiteralExpression;
}

export function objectLiteralExpression(expr: ts.CallExpression): Maybe<ts.ObjectLiteralExpression> {
    return Maybe.lift(expr.arguments[0])
        .fmap(arg0 => (isObjectLiteralExpression(arg0) ? arg0 as ts.ObjectLiteralExpression : undefined));
}

export function isIdentifier(expr: ts.PropertyName | ts.LeftHandSideExpression): expr is ts.Identifier {
    return expr && expr.kind === kinds.Identifier;
}

export function withIdentifier(identifier: string): (expr: ts.CallExpression) => Maybe<ts.CallExpression> {
    return ifTrue(
        (expr: ts.CallExpression) => (
            isIdentifier(expr.expression) && expr.expression.text === identifier
        ));
}

export type WithStringInitializer = ts.StringLiteral | ts.NoSubstitutionTemplateLiteral;

export function isProperty(propName: string, p: ts.ObjectLiteralElement): boolean {
    return isPropertyAssignment(p) && isIdentifier(p.name) && p.name.text === propName;
}

export function getInitializer(p: ts.ObjectLiteralElement): Maybe<ts.Expression> {
    return Maybe.lift(
        (isPropertyAssignment(p) && isIdentifier(p.name)) ? p.initializer : undefined);
}

export function getStringInitializerFromProperty(propertyName: string, ps: ts.ObjectLiteralElement[]): Maybe<WithStringInitializer> {
    const property = ps.find(p => isProperty(propertyName, p));
    return getInitializer(property)
    // A little wrinkle to return Maybe<WithStringInitializer>
        .fmap(expr => isSimpleTemplateString(expr) ? expr as WithStringInitializer : undefined);
}

export function decoratorArgument(dec: ts.Decorator): Maybe<ts.ObjectLiteralExpression> {
    return Maybe.lift(dec)
        .bind(callExpression)
        .bind(objectLiteralExpression);
}

export function isDecorator(expr: ts.Node): expr is ts.Decorator {
    return expr && expr.kind === kinds.Decorator;
}

