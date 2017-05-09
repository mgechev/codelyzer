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
var ngWalker_1 = require("./angular/ngWalker");
var SyntaxKind = require("./util/syntaxKind");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.metadata = {
    ruleName: 'pipe-impure',
    type: 'functionality',
    description: "Pipes cannot be declared as impure.",
    rationale: "Impure pipes do not perform well because they are run on every change detection cycle.",
    options: null,
    optionsDescription: "Not configurable.",
    typescriptOnly: true,
};
Rule.FAILURE = 'Warning: impure pipe declared in class %s.';
exports.Rule = Rule;
var ClassMetadataWalker = (function (_super) {
    __extends(ClassMetadataWalker, _super);
    function ClassMetadataWalker(sourceFile, rule) {
        var _this = _super.call(this, sourceFile, rule.getOptions()) || this;
        _this.rule = rule;
        return _this;
    }
    ClassMetadataWalker.prototype.visitNgPipe = function (controller, decorator) {
        this.validateProperties(controller.name.text, decorator);
    };
    ClassMetadataWalker.prototype.validateProperties = function (className, pipe) {
        var argument = this.extractArgument(pipe);
        if (argument.kind === SyntaxKind.current().ObjectLiteralExpression) {
            argument.properties.filter(function (n) { return n.name.text === 'pure'; })
                .forEach(this.validateProperty.bind(this, className));
        }
    };
    ClassMetadataWalker.prototype.extractArgument = function (pipe) {
        var baseExpr = pipe.expression || {};
        var args = baseExpr.arguments || [];
        return args[0];
    };
    ClassMetadataWalker.prototype.validateProperty = function (className, property) {
        var propValue = property.initializer.getText();
        if (propValue === 'false') {
            this.addFailure(this.createFailure(property.getStart(), property.getWidth(), sprintf_js_1.sprintf.apply(this, this.createFailureArray(className))));
        }
    };
    ClassMetadataWalker.prototype.createFailureArray = function (className) {
        return [Rule.FAILURE, className];
    };
    return ClassMetadataWalker;
}(ngWalker_1.NgWalker));
exports.ClassMetadataWalker = ClassMetadataWalker;
