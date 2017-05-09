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
var SyntaxKind = require("./util/syntaxKind");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ExpressionCallMetadataWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.metadata = {
    ruleName: 'no-forward-ref',
    type: 'maintainability',
    description: "Disallows usage of forward references for DI.",
    rationale: "The flow of DI is disrupted by using `forwardRef` and might make code more difficult to understand.",
    options: null,
    optionsDescription: "Not configurable.",
    typescriptOnly: true,
};
Rule.FAILURE_IN_CLASS = 'Avoid using forwardRef in class "%s"';
Rule.FAILURE_IN_VARIABLE = 'Avoid using forwardRef in variable "%s"';
exports.Rule = Rule;
var ExpressionCallMetadataWalker = (function (_super) {
    __extends(ExpressionCallMetadataWalker, _super);
    function ExpressionCallMetadataWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpressionCallMetadataWalker.prototype.visitCallExpression = function (node) {
        this.validateCallExpression(node);
        _super.prototype.visitCallExpression.call(this, node);
    };
    ExpressionCallMetadataWalker.prototype.validateCallExpression = function (callExpression) {
        if (callExpression.expression.text === 'forwardRef') {
            var currentNode = callExpression;
            while (currentNode.parent.parent) {
                currentNode = currentNode.parent;
            }
            var failureConfig = [];
            if (currentNode.kind === SyntaxKind.current().VariableStatement) {
                failureConfig = [Rule.FAILURE_IN_VARIABLE, currentNode.declarationList.declarations[0].name.text];
            }
            else {
                failureConfig = [Rule.FAILURE_IN_CLASS, currentNode.name.text];
            }
            this.addFailure(this.createFailure(callExpression.getStart(), callExpression.getWidth(), sprintf_js_1.sprintf.apply(this, failureConfig)));
        }
    };
    return ExpressionCallMetadataWalker;
}(Lint.RuleWalker));
exports.ExpressionCallMetadataWalker = ExpressionCallMetadataWalker;
