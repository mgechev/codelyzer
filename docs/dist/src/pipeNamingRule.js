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
var ngWalker_1 = require("./angular/ngWalker");
var selectorValidator_1 = require("./util/selectorValidator");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule(options) {
        var _this = _super.call(this, options) || this;
        var args = options.ruleArguments;
        if (!(args instanceof Array)) {
            args = [args];
        }
        if (args[0] === 'camelCase') {
            _this.validator = selectorValidator_1.SelectorValidator.camelCase;
        }
        if (args.length > 1) {
            _this.hasPrefix = true;
            var prefixExpression = (args.slice(1) || []).join('|');
            _this.prefix = (args.slice(1) || []).join(',');
            _this.prefixChecker = selectorValidator_1.SelectorValidator.prefix(prefixExpression, 'camelCase');
        }
        return _this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this));
    };
    Rule.prototype.validateName = function (name) {
        return this.validator(name);
    };
    Rule.prototype.validatePrefix = function (prefix) {
        return this.prefixChecker(prefix);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.metadata = {
    ruleName: 'pipe-naming-rule',
    type: 'style',
    description: "Enforce consistent case and prefix for pipes.",
    rationale: "Consistent conventions make it easy to quickly identify and reference assets of different types.",
    options: {
        'type': 'array',
        'items': [
            { 'enum': ['kebab-case', 'attribute'] },
            { 'type': 'string' }
        ],
        'minItems': 1
    },
    optionExamples: [
        "[\"camelCase\", \"myPrefix\"]",
        "[\"camelCase\", \"myPrefix\", \"myOtherPrefix\"]",
        "[\"kebab-case\", \"my-prefix\"]",
    ],
    optionsDescription: (_a = ["\n    * The first item in the array is `\"kebab-case\"` or `\"camelCase\"`, which allows you to pick a case.\n    * The rest of the arguments are supported prefixes (given as strings). They are optional."], _a.raw = ["\n    * The first item in the array is \\`\"kebab-case\"\\` or \\`\"camelCase\"\\`, which allows you to pick a case.\n    * The rest of the arguments are supported prefixes (given as strings). They are optional."], Lint.Utils.dedent(_a)),
    typescriptOnly: true,
};
Rule.FAILURE_WITHOUT_PREFIX = 'The name of the Pipe decorator of class %s should' +
    ' be named camelCase, however its value is "%s".';
Rule.FAILURE_WITH_PREFIX = 'The name of the Pipe decorator of class %s should' +
    ' be named camelCase with prefix %s, however its value is "%s".';
exports.Rule = Rule;
var ClassMetadataWalker = (function (_super) {
    __extends(ClassMetadataWalker, _super);
    function ClassMetadataWalker(sourceFile, rule) {
        var _this = _super.call(this, sourceFile, rule.getOptions()) || this;
        _this.rule = rule;
        return _this;
    }
    ClassMetadataWalker.prototype.visitNgPipe = function (controller, decorator) {
        var className = controller.name.text;
        this.validateProperties(className, decorator);
    };
    ClassMetadataWalker.prototype.validateProperties = function (className, pipe) {
        var argument = this.extractArgument(pipe);
        if (argument.kind === SyntaxKind.current().ObjectLiteralExpression) {
            argument.properties.filter(function (n) { return n.name.text === 'name'; })
                .forEach(this.validateProperty.bind(this, className));
        }
    };
    ClassMetadataWalker.prototype.extractArgument = function (pipe) {
        var baseExpr = pipe.expression || {};
        var args = baseExpr.arguments || [];
        return args[0];
    };
    ClassMetadataWalker.prototype.validateProperty = function (className, property) {
        var propName = property.initializer.text;
        var isValidName = this.rule.validateName(propName);
        var isValidPrefix = (this.rule.hasPrefix ? this.rule.validatePrefix(propName) : true);
        if (!isValidName || !isValidPrefix) {
            this.addFailure(this.createFailure(property.getStart(), property.getWidth(), sprintf_js_1.sprintf.apply(this, this.createFailureArray(className, propName))));
        }
    };
    ClassMetadataWalker.prototype.createFailureArray = function (className, pipeName) {
        if (this.rule.hasPrefix) {
            return [Rule.FAILURE_WITH_PREFIX, className, this.rule.prefix, pipeName];
        }
        return [Rule.FAILURE_WITHOUT_PREFIX, className, pipeName];
    };
    return ClassMetadataWalker;
}(ngWalker_1.NgWalker));
exports.ClassMetadataWalker = ClassMetadataWalker;
var _a;
