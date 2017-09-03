import * as ts from 'typescript';
import { Maybe } from './function';
import {
    decoratorArgument, getInitializer, isProperty, isArrayLiteralExpression,
    WithStringInitializer, getStringInitializerFromProperty
} from './astQuery';

export function getInlineStyle(dec: ts.Decorator): Maybe<ts.ArrayLiteralExpression> {
    return decoratorArgument(dec)
        .bind((expr: ts.ObjectLiteralExpression) => {
            const property = expr.properties.find(p => isProperty('styles', p));
            return getInitializer(property)
                .fmap(expr =>
                    isArrayLiteralExpression(expr) ? expr as ts.ArrayLiteralExpression : undefined);
        });
}

export function getTemplateUrl(dec: ts.Decorator): Maybe<WithStringInitializer> {
    return decoratorArgument(dec)
        .bind((expr: ts.ObjectLiteralExpression) =>
            getStringInitializerFromProperty('templateUrl', expr.properties));
}

export function getTemplate(dec: ts.Decorator): Maybe<WithStringInitializer> {
    return decoratorArgument(dec)
        .bind((expr: ts.ObjectLiteralExpression) =>
            getStringInitializerFromProperty('template', expr.properties));
}

