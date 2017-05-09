"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var syntaxKind_1 = require("../../util/syntaxKind");
var utils_1 = require("../../util/utils");
var kinds = syntaxKind_1.current();
var AbstractResolver = (function () {
    function AbstractResolver() {
    }
    AbstractResolver.prototype.getTemplateUrl = function (decorator) {
        var arg = this.getDecoratorArgument(decorator);
        if (!arg) {
            return null;
        }
        var prop = arg.properties.filter(function (p) {
            if (p.name.text === 'templateUrl' && utils_1.isSimpleTemplateString(p.initializer)) {
                return true;
            }
            return false;
        }).pop();
        if (prop) {
            return prop.initializer.text;
        }
        else {
            return null;
        }
    };
    AbstractResolver.prototype.getStyleUrls = function (decorator) {
        var arg = this.getDecoratorArgument(decorator);
        if (!arg) {
            return [];
        }
        var prop = arg.properties.filter(function (p) {
            if (p.name.text === 'styleUrls' && p.initializer.kind === kinds.ArrayLiteralExpression) {
                return true;
            }
            return false;
        }).pop();
        if (prop) {
            return prop.initializer.elements.filter(function (e) {
                return utils_1.isSimpleTemplateString(e);
            }).map(function (e) {
                return e.text;
            });
        }
        else {
            return [];
        }
    };
    AbstractResolver.prototype.getDecoratorArgument = function (decorator) {
        var expr = decorator.expression;
        if (expr && expr.arguments && expr.arguments.length) {
            var arg = expr.arguments[0];
            if (arg.kind === kinds.ObjectLiteralExpression && arg.properties) {
                return arg;
            }
        }
        return null;
    };
    return AbstractResolver;
}());
exports.AbstractResolver = AbstractResolver;
