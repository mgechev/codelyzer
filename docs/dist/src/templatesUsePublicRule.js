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
var utils_1 = require("./util/utils");
var classDeclarationUtils_1 = require("./util/classDeclarationUtils");
var ngWalker_1 = require("./angular/ngWalker");
var recursiveAngularExpressionVisitor_1 = require("./angular/templates/recursiveAngularExpressionVisitor");
var SyntaxKind = require("./util/syntaxKind");
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
        if (ast.receiver && (ast.receiver.name || ast.receiver.key)) {
            var receiver = ast.receiver;
            while (receiver.receiver.name) {
                receiver = receiver.receiver;
            }
            ast = receiver;
        }
        if (this.preDefinedVariables[ast.name]) {
            return;
        }
        var allMembers = classDeclarationUtils_1.getDeclaredMethods(this.context.controller).concat(classDeclarationUtils_1.getDeclaredProperties(this.context.controller));
        var member = allMembers.filter(function (m) { return m.name && m.name.text === ast.name; }).pop();
        if (member) {
            var isPublic = !member.modifiers || !member.modifiers
                .some(function (m) { return m.kind === SyntaxKind.current().PrivateKeyword || m.kind === SyntaxKind.current().ProtectedKeyword; });
            var width = ast.name.length;
            if (!isPublic) {
                var failureString = "You can bind only to public class members. \"" + member.name.getText() + "\" is not a public class member.";
                this.addFailure(this.createFailure(ast.span.start, width, failureString));
            }
        }
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
    ruleName: 'templates-use-public-rule',
    type: 'functionality',
    description: "Ensure that properties and methods accessed from the template are public.",
    rationale: "When Angular compiles the templates, it has to access these properties from outside the class.",
    options: null,
    optionsDescription: "Not configurable.",
    typescriptOnly: true,
};
Rule.FAILURE = 'The %s "%s" that you\'re trying to access does not exist in the class declaration.';
exports.Rule = Rule;
