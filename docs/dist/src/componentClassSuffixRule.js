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
var walkerFactory_1 = require("./walkerFactory/walkerFactory");
var walkerFn_1 = require("./walkerFactory/walkerFn");
var function_1 = require("./util/function");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.validate = function (className, suffixList) {
        return suffixList.some(function (suffix) { return className.endsWith(suffix); });
    };
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(Rule.walkerBuilder(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.metadata = {
    ruleName: 'component-class-suffix',
    type: 'style',
    description: "Classes decorated with @Component must have suffix \"Component\" (or custom) in their name.",
    descriptionDetails: "See more at https://angular.io/styleguide#!#02-03.",
    rationale: "Consistent conventions make it easy to quickly identify and reference assets of different types.",
    options: {
        type: 'array',
        items: {
            type: 'string',
        }
    },
    optionExamples: [
        "true",
        "[true, \"Component\", \"View\"]"
    ],
    optionsDescription: "Supply a list of allowed component suffixes. Defaults to \"Component\".",
    typescriptOnly: true,
};
Rule.FAILURE = 'The name of the class %s should end with the suffix %s ($$02-03$$)';
Rule.walkerBuilder = walkerFn_1.all(walkerFn_1.validateComponent(function (meta, suffixList) {
    return function_1.Maybe.lift(meta.controller)
        .fmap(function (controller) { return controller.name; })
        .fmap(function (name) {
        var className = name.text;
        if (suffixList.length === 0) {
            suffixList = ['Component'];
        }
        if (!Rule.validate(className, suffixList)) {
            return [new walkerFactory_1.Failure(name, sprintf_js_1.sprintf(Rule.FAILURE, className, suffixList))];
        }
    });
}));
exports.Rule = Rule;
