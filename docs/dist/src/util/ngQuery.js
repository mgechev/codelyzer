"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var astQuery_1 = require("./astQuery");
function getInlineStyle(dec) {
    return astQuery_1.decoratorArgument(dec)
        .bind(function (expr) {
        var property = expr.properties.find(function (p) { return astQuery_1.isProperty('styles', p); });
        return astQuery_1.getInitializer(property)
            .fmap(function (expr) {
            return astQuery_1.isArrayLiteralExpression(expr) ? expr : undefined;
        });
    });
}
exports.getInlineStyle = getInlineStyle;
function getTemplateUrl(dec) {
    return astQuery_1.decoratorArgument(dec)
        .bind(function (expr) {
        return astQuery_1.getStringInitializerFromProperty('templateUrl', expr.properties);
    });
}
exports.getTemplateUrl = getTemplateUrl;
function getTemplate(dec) {
    return astQuery_1.decoratorArgument(dec)
        .bind(function (expr) {
        return astQuery_1.getStringInitializerFromProperty('template', expr.properties);
    });
}
exports.getTemplate = getTemplate;
