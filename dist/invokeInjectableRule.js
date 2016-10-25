"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require('tslint/lib/lint');
var ng2Walker_1 = require('./angular/ng2Walker');
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ValidateInjectableWalker(sourceFile, this.getOptions()));
    };
    Rule.FAILURE_STRING = 'You have to invoke @Injectable()';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var ValidateInjectableWalker = (function (_super) {
    __extends(ValidateInjectableWalker, _super);
    function ValidateInjectableWalker() {
        _super.apply(this, arguments);
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
}(ng2Walker_1.Ng2Walker));
exports.ValidateInjectableWalker = ValidateInjectableWalker;
