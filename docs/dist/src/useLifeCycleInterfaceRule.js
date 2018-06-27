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
var getInterfaceName = function (t) {
    if (t.expression && t.expression.name) {
        return t.expression.name.text;
    }
    return t.expression.text;
};
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.metadata = {
    ruleName: 'use-life-cycle-interface',
    type: 'maintainability',
    description: "Ensure that components implement life cycle interfaces if they use them.",
    descriptionDetails: "See more at https://angular.io/styleguide#!#09-01.",
    rationale: "Interfaces prescribe typed method signatures. Use those signatures to flag spelling and syntax mistakes.",
    options: null,
    optionsDescription: "Not configurable.",
    typescriptOnly: true,
};
Rule.FAILURE = 'Implement lifecycle hook interface %s for method %s in class %s ($$09-01$$)';
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
exports.Rule = Rule;
var ClassMetadataWalker = (function (_super) {
    __extends(ClassMetadataWalker, _super);
    function ClassMetadataWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
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
                var hookName = n.substr(2, n.length);
                _this.addFailure(_this.createFailure(m.name.getStart(), m.name.getWidth(), sprintf_js_1.sprintf.apply(_this, [Rule.FAILURE, hookName, Rule.HOOKS_PREFIX + hookName, className])));
            }
        });
    };
    ClassMetadataWalker.prototype.isMethodValidHook = function (m, interfaces) {
        var n = m.name.text;
        var isNg = n.substr(0, 2) === Rule.HOOKS_PREFIX;
        var hookName = n.substr(2, n.length);
        var isHook = Rule.LIFE_CYCLE_HOOKS_NAMES.indexOf(hookName) !== -1;
        var isNotIn = interfaces.indexOf(hookName) === -1;
        return isNg && isHook && isNotIn;
    };
    return ClassMetadataWalker;
}(Lint.RuleWalker));
exports.ClassMetadataWalker = ClassMetadataWalker;
