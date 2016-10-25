"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require('tslint/lib/lint');
var sprintf_js_1 = require('sprintf-js');
var SyntaxKind = require('./util/syntaxKind');
var getInterfaceName = function (t) {
    if (t.expression && t.expression.name) {
        return t.expression.name.text;
    }
    return t.expression.text;
};
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
    };
    Rule.FAILURE = 'Implement lifecycle hook interface %s for method %s in class %s (https://goo.gl/w1Nwk3)';
    Rule.HOOKS_PREFIX = 'ng';
    Rule.LIFE_CYCLE_HOOKS_NAMES = [
        'OnChanges',
        'OnInit',
        'DoCheck',
        'AfterContentInit',
        'AfterContentChecked',
        'AfterViewInit',
        'AfterViewChecked',
        'OnDestroy'
    ];
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var ClassMetadataWalker = (function (_super) {
    __extends(ClassMetadataWalker, _super);
    function ClassMetadataWalker() {
        _super.apply(this, arguments);
    }
    ClassMetadataWalker.prototype.visitClassDeclaration = function (node) {
        var syntaxKind = SyntaxKind.current();
        var className = node.name.text;
        var interfaces = this.extractInterfaces(node, syntaxKind);
        var methods = node.members.filter(function (m) { return m.kind === syntaxKind.MethodDeclaration; });
        this.validateMethods(methods, interfaces, className);
        _super.prototype.visitClassDeclaration.call(this, node);
    };
    ClassMetadataWalker.prototype.extractInterfaces = function (node, syntaxKind) {
        var interfaces = [];
        if (node.heritageClauses) {
            var interfacesClause = node.heritageClauses.filter(function (h) { return h.token === syntaxKind.ImplementsKeyword; });
            if (interfacesClause.length !== 0) {
                interfaces = interfacesClause[0].types.map(getInterfaceName);
            }
        }
        return interfaces;
    };
    ClassMetadataWalker.prototype.validateMethods = function (methods, interfaces, className) {
        var _this = this;
        methods.forEach(function (m) {
            var n = m.name.text;
            if (n && _this.isMethodValidHook(m, interfaces)) {
                var hookName = n.substr(2, n.lenght);
                _this.addFailure(_this.createFailure(m.name.getStart(), m.name.getWidth(), sprintf_js_1.sprintf.apply(_this, [Rule.FAILURE, hookName, Rule.HOOKS_PREFIX + hookName, className])));
            }
        });
    };
    ClassMetadataWalker.prototype.isMethodValidHook = function (m, interfaces) {
        var n = m.name.text;
        var isNg = n.substr(0, 2) === Rule.HOOKS_PREFIX;
        var hookName = n.substr(2, n.lenght);
        var isHook = Rule.LIFE_CYCLE_HOOKS_NAMES.indexOf(hookName) !== -1;
        var isNotIn = interfaces.indexOf(hookName) === -1;
        return isNg && isHook && isNotIn;
    };
    return ClassMetadataWalker;
}(Lint.RuleWalker));
exports.ClassMetadataWalker = ClassMetadataWalker;
