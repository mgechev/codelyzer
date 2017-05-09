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
var ngWalker_1 = require("./angular/ngWalker");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ValidateInjectableWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.metadata = {
    ruleName: 'invoke-injectable',
    type: 'functionality',
    description: "Ensures that @Injectable decorator is properly invoked.",
    rationale: "Application will fail mysteriously if we forget the parentheses.",
    options: null,
    optionsDescription: "Not configurable.",
    typescriptOnly: true,
};
Rule.FAILURE_STRING = 'You have to invoke @Injectable()';
exports.Rule = Rule;
var ValidateInjectableWalker = (function (_super) {
    __extends(ValidateInjectableWalker, _super);
    function ValidateInjectableWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValidateInjectableWalker.prototype.visitClassDeclaration = function (declaration) {
        var _this = this;
        (declaration.decorators || [])
            .forEach(function (d) {
            if (d.expression && d.expression.text === 'Injectable') {
                _this.addFailure(_this.createFailure(d.getStart(), d.getWidth(), Rule.FAILURE_STRING));
            }
        });
    };
    return ValidateInjectableWalker;
}(ngWalker_1.NgWalker));
exports.ValidateInjectableWalker = ValidateInjectableWalker;
