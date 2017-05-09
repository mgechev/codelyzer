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
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new InputMetadataWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.metadata = {
    ruleName: 'no-input-rename-rule',
    type: 'maintainability',
    description: "Disallows renaming directive inputs by providing a string to the decorator.",
    descriptionDetails: "See more at https://angular.io/styleguide#!#05-13.",
    rationale: "Two names for the same property (one private, one public) is inherently confusing.",
    options: null,
    optionsDescription: "Not configurable.",
    typescriptOnly: true,
};
Rule.FAILURE_STRING = 'In the class "%s", the directive ' +
    'input property "%s" should not be renamed.' +
    'Please, consider the following use "@Input() %s: string"';
exports.Rule = Rule;
var InputMetadataWalker = (function (_super) {
    __extends(InputMetadataWalker, _super);
    function InputMetadataWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InputMetadataWalker.prototype.visitNgInput = function (property, input, args) {
        var className = property.parent.name.text;
        var memberName = property.name.text;
        if (args.length !== 0 && memberName !== args[0]) {
            var failureConfig = [className, memberName, memberName];
            failureConfig.unshift(Rule.FAILURE_STRING);
            this.addFailure(this.createFailure(property.getStart(), property.getWidth(), sprintf_js_1.sprintf.apply(this, failureConfig)));
        }
    };
    return InputMetadataWalker;
}(ngWalker_1.NgWalker));
exports.InputMetadataWalker = InputMetadataWalker;
