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
var walkerFn_1 = require("./walkerFactory/walkerFn");
var function_1 = require("./util/function");
var astQuery_1 = require("./util/astQuery");
var walkerFactory_1 = require("./walkerFactory/walkerFactory");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.decoratorIsAttribute = function (dec) {
        if (astQuery_1.isDecorator(dec)) {
            return astQuery_1.callExpression(dec).bind(astQuery_1.withIdentifier('Attribute'));
        }
        return function_1.Maybe.nothing;
    };
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(Rule.walkerBuilder(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.metadata = {
    ruleName: 'no-attribute-parameter-decorator-rule',
    type: 'maintainability',
    description: "Disallow usage of @Attribute decorator",
    rationale: "@Attribute is considered bad practice. Use @Input instead.",
    options: null,
    optionsDescription: "Not configurable.",
    typescriptOnly: true,
};
Rule.FAILURE_STRING = 'In the constructor of class "%s",' +
    ' the parameter "%s" uses the @Attribute decorator, ' +
    'which is considered as a bad practice. Please,' +
    ' consider construction of type "@Input() %s: string"';
Rule.walkerBuilder = walkerFn_1.all(walkerFn_1.validate(SyntaxKind.current().Constructor)(function (node) {
    var syntaxKind = SyntaxKind.current();
    return function_1.Maybe.lift(node.parent)
        .fmap(function (parent) {
        if (parent.kind === syntaxKind.ClassExpression) {
            return parent.parent.name.text;
        }
        else if (parent.kind = syntaxKind.ClassDeclaration) {
            return parent.name.text;
        }
    })
        .bind(function (parentName) {
        var failures = node.parameters.map(function (p) {
            return function_1.Maybe.lift(p.decorators)
                .bind(function (decorators) {
                var decoratorsFailed = function_1.listToMaybe(decorators.map(function (d) { return Rule.decoratorIsAttribute(d); }));
                return decoratorsFailed.fmap(function () {
                    return new walkerFactory_1.Failure(p, sprintf_js_1.sprintf(Rule.FAILURE_STRING, parentName, p.name.text, p.name.text));
                });
            });
        });
        return function_1.listToMaybe(failures);
    });
}));
exports.Rule = Rule;
