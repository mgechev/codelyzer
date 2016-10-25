"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require('typescript');
var Lint = require('tslint/lib/lint');
var sprintf_js_1 = require('sprintf-js');
var SyntaxKind = require('./util/syntaxKind');
(function (COMPONENT_TYPE) {
    COMPONENT_TYPE[COMPONENT_TYPE["COMPONENT"] = 0] = "COMPONENT";
    COMPONENT_TYPE[COMPONENT_TYPE["DIRECTIVE"] = 1] = "DIRECTIVE";
    COMPONENT_TYPE[COMPONENT_TYPE["ANY"] = 2] = "ANY";
})(exports.COMPONENT_TYPE || (exports.COMPONENT_TYPE = {}));
var COMPONENT_TYPE = exports.COMPONENT_TYPE;
;
var SelectorRule = (function (_super) {
    __extends(SelectorRule, _super);
    function SelectorRule(ruleName, value, disabledIntervals, validator, failureString, target) {
        if (target === void 0) { target = COMPONENT_TYPE.ANY; }
        _super.call(this, ruleName, value, disabledIntervals);
        this.validator = validator;
        this.failureString = failureString;
        this.target = target;
    }
    SelectorRule.prototype.apply = function (sourceFile) {
        var documentRegistry = ts.createDocumentRegistry();
        var languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
        var languageService = ts.createLanguageService(languageServiceHost, documentRegistry);
        return this.applyWithWalker(new SelectorNameValidatorWalker(sourceFile, languageService, this));
    };
    SelectorRule.prototype.getFailureString = function (failureConfig) {
        return sprintf_js_1.sprintf(this.failureString, failureConfig.className, this.getOptions().ruleArguments, failureConfig.selector);
    };
    SelectorRule.prototype.validate = function (selector) {
        return this.validator(selector);
    };
    Object.defineProperty(SelectorRule.prototype, "targetType", {
        get: function () {
            return this.target;
        },
        enumerable: true,
        configurable: true
    });
    return SelectorRule;
}(Lint.Rules.AbstractRule));
exports.SelectorRule = SelectorRule;
var SelectorNameValidatorWalker = (function (_super) {
    __extends(SelectorNameValidatorWalker, _super);
    function SelectorNameValidatorWalker(sourceFile, languageService, rule) {
        _super.call(this, sourceFile, rule.getOptions());
        this.rule = rule;
        this.languageService = languageService;
        this.typeChecker = languageService.getProgram().getTypeChecker();
    }
    SelectorNameValidatorWalker.prototype.visitClassDeclaration = function (node) {
        (node.decorators || [])
            .forEach(this.validateDecorator.bind(this, node.name.text));
        _super.prototype.visitClassDeclaration.call(this, node);
    };
    SelectorNameValidatorWalker.prototype.validateDecorator = function (className, decorator) {
        var baseExpr = decorator.expression || {};
        var expr = baseExpr.expression || {};
        var name = expr.text;
        var args = baseExpr.arguments || [];
        var arg = args[0];
        if (this.rule.targetType === COMPONENT_TYPE.ANY ||
            name === 'Component' && this.rule.targetType === COMPONENT_TYPE.COMPONENT ||
            name === 'Directive' && this.rule.targetType === COMPONENT_TYPE.DIRECTIVE) {
            this.validateSelector(className, arg);
        }
    };
    SelectorNameValidatorWalker.prototype.validateSelector = function (className, arg) {
        var _this = this;
        if (arg.kind === SyntaxKind.current().ObjectLiteralExpression) {
            arg.properties.filter(function (prop) { return prop.name.text === 'selector'; })
                .forEach(function (prop) {
                var p = prop;
                if (p.initializer && isSupportedKind(p.initializer.kind) && !_this.rule.validate(p.initializer.text)) {
                    var error = _this.rule.getFailureString({ selector: p.initializer.text, className: className });
                    _this.addFailure(_this.createFailure(p.initializer.getStart(), p.initializer.getWidth(), error));
                }
            });
        }
        function isSupportedKind(kind) {
            var current = SyntaxKind.current();
            return [current.StringLiteral, current.NoSubstitutionTemplateLiteral].some(function (kindType) { return kindType === kind; });
        }
    };
    return SelectorNameValidatorWalker;
}(Lint.RuleWalker));
