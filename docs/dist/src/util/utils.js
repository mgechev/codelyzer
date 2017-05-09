"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var SyntaxKind = require('./syntaxKind');
exports.stringDistance = function (s, t, ls, lt) {
    if (ls === void 0) { ls = s.length; }
    if (lt === void 0) { lt = t.length; }
    var memo = [];
    var currRowMemo;
    var i;
    var k;
    for (k = 0; k <= lt; k += 1) {
        memo[k] = k;
    }
    for (i = 1; i <= ls; i += 1) {
        currRowMemo = [i];
        for (k = 1; k <= lt; k += 1) {
            currRowMemo[k] = Math.min(currRowMemo[k - 1] + 1, memo[k] + 1, memo[k - 1] + (s[i - 1] !== t[k - 1] ? 1 : 0));
        }
        memo = currRowMemo;
    }
    return memo[lt];
};
exports.isSimpleTemplateString = function (e) {
    return e.kind === ts.SyntaxKind.StringLiteral ||
        e.kind === SyntaxKind.current().FirstTemplateToken;
};
exports.getDecoratorPropertyInitializer = function (decorator, name) {
    return decorator.expression.arguments[0]
        .properties.map(function (prop) {
        if (prop.name.text === name) {
            return prop;
        }
        return null;
    }).filter(function (el) { return !!el; }).map(function (prop) { return prop.initializer; }).pop();
};
exports.getDecoratorName = function (decorator) {
    var baseExpr = decorator.expression || {};
    var expr = baseExpr.expression || {};
    return expr.text;
};
exports.getComponentDecorator = function (declaration) {
    return (declaration.decorators || [])
        .filter(function (d) {
        if (!d.expression.arguments ||
            !d.expression.arguments.length ||
            !d.expression.arguments[0].properties) {
            return false;
        }
        var name = exports.getDecoratorName(d);
        if (name === 'Component') {
            return true;
        }
    }).pop();
};
