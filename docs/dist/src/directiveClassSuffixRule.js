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
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.validate = function (className, suffix) {
        return className.endsWith(suffix);
    };
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.metadata = {
    ruleName: 'directive-class-suffix',
    type: 'style',
    description: "Classes decorated with @Directive must have suffix \"Directive\" (or custom) in their name.",
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
        "[true, \"Directive\", \"MySuffix\"]",
    ],
    optionsDescription: "Supply a list of allowed component suffixes. Defaults to \"Directive\".",
    typescriptOnly: true,
};
Rule.FAILURE = 'The name of the class %s should end with the suffix %s ($$02-03$$)';
exports.Rule = Rule;
var ClassMetadataWalker = (function (_super) {
    __extends(ClassMetadataWalker, _super);
    function ClassMetadataWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClassMetadataWalker.prototype.visitNgDirective = function (meta) {
        var name = meta.controller.name;
        var className = name.text;
        var suffix = this.getOptions()[0] || 'Directive';
        if (!Rule.validate(className, suffix)) {
            this.addFailure(this.createFailure(name.getStart(), name.getWidth(), sprintf_js_1.sprintf.apply(this, [Rule.FAILURE, className, suffix])));
        }
    };
    return ClassMetadataWalker;
}(ngWalker_1.NgWalker));
exports.ClassMetadataWalker = ClassMetadataWalker;
