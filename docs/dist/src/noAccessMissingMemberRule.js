"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Lint = require("tslint");
var sprintf_js_1 = require("sprintf-js");
var utils_1 = require("./util/utils");
var ngWalker_1 = require("./angular/ngWalker");
var recursiveAngularExpressionVisitor_1 = require("./angular/templates/recursiveAngularExpressionVisitor");
var expressionTypes_1 = require("./angular/expressionTypes");
var classDeclarationUtils_1 = require("./util/classDeclarationUtils");
var DeclarationType;
(function (DeclarationType) {
    DeclarationType[DeclarationType["Property"] = 0] = "Property";
    DeclarationType[DeclarationType["Method"] = 1] = "Method";
})(DeclarationType || (DeclarationType = {}));
var SymbolAccessValidator = (function (_super) {
    __extends(SymbolAccessValidator, _super);
    function SymbolAccessValidator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SymbolAccessValidator.prototype.visitPropertyRead = function (ast, context) {
        return this.doCheck(ast, DeclarationType.Property, context);
    };
    SymbolAccessValidator.prototype.visitMethodCall = function (ast, context) {
        this.doCheck(ast, DeclarationType.Method, context);
    };
    SymbolAccessValidator.prototype.visitPropertyWrite = function (ast, context) {
        this.doCheck(ast, DeclarationType.Property, context);
    };
    SymbolAccessValidator.prototype.doCheck = function (ast, type, context) {
        var symbolType;
        var available;
        if (type === DeclarationType.Method) {
            symbolType = 'method';
        }
        else {
            symbolType = 'property';
        }
        available = Object.assign({}, classDeclarationUtils_1.getDeclaredMethodNames(this.context.controller), classDeclarationUtils_1.getDeclaredPropertyNames(this.context.controller), this.preDefinedVariables);
        var tmp = ast;
        while (tmp && !expressionTypes_1.ExpTypes.ImplicitReceiver(tmp)) {
            ast = tmp;
            if (expressionTypes_1.ExpTypes.KeyedRead(tmp)) {
                tmp = tmp.obj;
            }
            else if (expressionTypes_1.ExpTypes.KeyedWrite(tmp)) {
                tmp = tmp.obj;
            }
            else if (expressionTypes_1.ExpTypes.PropertyRead(tmp)) {
                tmp = tmp.receiver;
            }
            else if (expressionTypes_1.ExpTypes.PropertyWrite(tmp)) {
                tmp = tmp.receiver;
            }
            else if (expressionTypes_1.ExpTypes.SafeMethodCall(tmp)) {
                tmp = tmp.receiver;
            }
            else if (expressionTypes_1.ExpTypes.SafePropertyRead(tmp)) {
                tmp = tmp.receiver;
            }
            else if (expressionTypes_1.ExpTypes.MethodCall(tmp)) {
                tmp = tmp.receiver;
            }
            else {
                break;
            }
        }
        if (ast.name && !available[ast.name]) {
            var failureString = sprintf_js_1.sprintf.apply(this, [Rule.FAILURE, symbolType, ast.name]);
            var top_1 = this.getTopSuggestion(Object.keys(available), ast.name);
            var getSuggestion = function (list) {
                if (list.length === 1) {
                    return "\"" + list[0] + "\"";
                }
                var result = "\"" + list.shift() + "\"";
                while (list.length > 1) {
                    result += ", \"" + list.shift() + "\"";
                }
                result += " or \"" + list.shift() + "\"";
                return result;
            };
            if (top_1.length && top_1[0].distance <= 2) {
                failureString += " Probably you mean: " + getSuggestion(top_1.map(function (s) { return s.element; })) + ".";
            }
            var width = ast.name.length;
            this.addFailure(this.createFailure(ast.span.start, width, failureString));
        }
        return null;
    };
    SymbolAccessValidator.prototype.getTopSuggestion = function (list, current) {
        var result = [];
        var tmp = list.map(function (e) {
            return {
                element: e,
                distance: utils_1.stringDistance(e, current)
            };
        }).sort(function (a, b) { return a.distance - b.distance; });
        var first = tmp.shift();
        if (!first) {
            return [];
        }
        else {
            result.push(first);
            var current_1;
            while (current_1 = tmp.shift()) {
                if (current_1.distance !== first.distance) {
                    return result;
                }
                else {
                    result.push(current_1);
                }
            }
            return result;
        }
    };
    return SymbolAccessValidator;
}(recursiveAngularExpressionVisitor_1.RecursiveAngularExpressionVisitor));
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ngWalker_1.NgWalker(sourceFile, this.getOptions(), {
            expressionVisitorCtrl: SymbolAccessValidator
        }));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.metadata = {
    ruleName: 'no-access-missing-member',
    type: 'functionality',
    description: "Disallows using non-existing properties and methods from the component in templates.",
    rationale: "Such occurances in code are most likely a result of a typo.",
    options: null,
    optionsDescription: "Not configurable.",
    typescriptOnly: true,
};
Rule.FAILURE = 'The %s "%s" that you\'re trying to access does not exist in the class declaration.';
exports.Rule = Rule;
