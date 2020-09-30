import * as ts from 'typescript';
import { decoratorArgument, getInitializer, getStringInitializerFromProperty, isProperty } from './astQuery';
import { Maybe } from './function';

export function getAnimations(dec: ts.Decorator): Maybe<ts.ArrayLiteralExpression | undefined> {
  return decoratorArgument(dec).bind((expr) => {
    const property = expr!.properties.find((p) => isProperty('animations', p))!;

    return getInitializer(property).fmap((expr) => (ts.isArrayLiteralExpression(expr!) ? (expr as ts.ArrayLiteralExpression) : undefined));
  });
}

export function getInlineStyle(dec: ts.Decorator): Maybe<ts.ArrayLiteralExpression | undefined> {
  return decoratorArgument(dec).bind((expr) => {
    const property = expr!.properties.find((p) => isProperty('styles', p))!;

    return getInitializer(property).fmap((expr) => (expr && ts.isArrayLiteralExpression(expr) ? expr : undefined));
  });
}

export function getTemplate(dec: ts.Decorator): Maybe<ts.StringLiteral | undefined> {
  return decoratorArgument(dec).bind((expr) => getStringInitializerFromProperty('template', expr!.properties));
}

export function getTemplateUrl(dec: ts.Decorator): Maybe<ts.StringLiteral | undefined> {
  return decoratorArgument(dec).bind((expr) => getStringInitializerFromProperty('templateUrl', expr!.properties));
}
