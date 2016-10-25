"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require('tslint/lib/lint');
var sprintf_js_1 = require('sprintf-js');
var SyntaxKind = require('./util/syntaxKind');
var ng2Walker_1 = require('./angular/ng2Walker');
var selectorValidator_1 = require('./util/selectorValidator');
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule(ruleName, value, disabledIntervals) {
        _super.call(this, ruleName, value, disabledIntervals);
        if (value[1] === 'camelCase') {
            this.validator = selectorValidator_1.SelectorValidator.camelCase;
        }
        if (value.length > 2) {
            this.hasPrefix = true;
            var prefixExpression = (value.slice(2) || []).join('|');
            this.prefix = (value.slice(2) || []).join(',');
            this.prefixChecker = selectorValidator_1.SelectorValidator.multiPrefix(prefixExpression);
        }
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
    Rule.FAILURE_WITHOUT_PREFIX = 'The name of the Pipe decorator of class %s should' +
        ' be named camelCase, however its value is "%s".';
    Rule.FAILURE_WITH_PREFIX = 'The name of the Pipe decorator of class %s should' +
        ' be named camelCase with prefix %s, however its value is "%s".';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var ClassMetadataWalker = (function (_super) {
    __extends(ClassMetadataWalker, _super);
    function ClassMetadataWalker(sourceFile, rule) {
        _super.call(this, sourceFile, rule.getOptions());
        this.rule = rule;
    }
    ClassMetadataWalker.prototype.visitNg2Pipe = function (controller, decorator) {
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
}(ng2Walker_1.Ng2Walker));
exports.ClassMetadataWalker = ClassMetadataWalker;
