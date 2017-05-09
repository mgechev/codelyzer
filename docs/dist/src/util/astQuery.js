"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var syntaxKind_1 = require("./syntaxKind");
var function_1 = require("./function");
var kinds = syntaxKind_1.current();
function isCallExpression(expr) {
    return expr && expr.kind === kinds.CallExpression;
}
exports.isCallExpression = isCallExpression;
function callExpression(dec) {
    return function_1.Maybe.lift(dec.expression)
        .fmap(function (expr) { return isCallExpression(expr) ? expr : undefined; });
}
exports.callExpression = callExpression;
function isPropertyAssignment(expr) {
    return expr && expr.kind === kinds.PropertyAssignment;
}
exports.isPropertyAssignment = isPropertyAssignment;
function isSimpleTemplateString(expr) {
    return expr && expr.kind === kinds.StringLiteral || expr.kind === kinds.NoSubstitutionTemplateLiteral;
}
exports.isSimpleTemplateString = isSimpleTemplateString;
function isArrayLiteralExpression(expr) {
    return expr && expr.kind === kinds.ArrayLiteralExpression;
}
exports.isArrayLiteralExpression = isArrayLiteralExpression;
function hasProperties(expr) {
    return expr && !!expr.properties;
}
exports.hasProperties = hasProperties;
function isObjectLiteralExpression(expr) {
    return expr && expr.kind === kinds.ObjectLiteralExpression;
}
exports.isObjectLiteralExpression = isObjectLiteralExpression;
function objectLiteralExpression(expr) {
    return function_1.Maybe.lift(expr.arguments[0])
        .fmap(function (arg0) { return (isObjectLiteralExpression(arg0) ? arg0 : undefined); });
}
exports.objectLiteralExpression = objectLiteralExpression;
function isIdentifier(expr) {
    return expr && expr.kind === kinds.Identifier;
}
exports.isIdentifier = isIdentifier;
function withIdentifier(identifier) {
    return function_1.ifTrue(function (expr) { return (isIdentifier(expr.expression) && expr.expression.text === identifier); });
}
exports.withIdentifier = withIdentifier;
function isProperty(propName, p) {
    return isPropertyAssignment(p) && isIdentifier(p.name) && p.name.text === propName;
}
exports.isProperty = isProperty;
function getInitializer(p) {
    return function_1.Maybe.lift((isPropertyAssignment(p) && isIdentifier(p.name)) ? p.initializer : undefined);
}
exports.getInitializer = getInitializer;
function getStringInitializerFromProperty(propertyName, ps) {
    var property = ps.find(function (p) { return isProperty(propertyName, p); });
    return getInitializer(property)
        .fmap(function (expr) { return isSimpleTemplateString(expr) ? expr : undefined; });
}
exports.getStringInitializerFromProperty = getStringInitializerFromProperty;
function decoratorArgument(dec) {
    return function_1.Maybe.lift(dec)
        .bind(callExpression)
        .bind(objectLiteralExpression);
}
exports.decoratorArgument = decoratorArgument;
function isDecorator(expr) {
    return expr && expr.kind === kinds.Decorator;
}
exports.isDecorator = isDecorator;
