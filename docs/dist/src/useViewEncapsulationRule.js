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
var utils_1 = require("./util/utils");
var Lint = require("tslint");
var ngWalker_1 = require("./angular/ngWalker");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var walker = new ViewEncapsulationWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.metadata = {
    ruleName: 'use-view-encapsulation',
    type: 'maintainability',
    description: 'Disallows using of ViewEncapsulation.None',
    rationale: '',
    options: null,
    optionsDescription: 'Not configurable',
    typescriptOnly: true
};
Rule.FAILURE = 'Using "ViewEncapsulation.None" will make your styles global which may have unintended effect';
exports.Rule = Rule;
var ViewEncapsulationWalker = (function (_super) {
    __extends(ViewEncapsulationWalker, _super);
    function ViewEncapsulationWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ViewEncapsulationWalker.prototype.visitClassDeclaration = function (node) {
        var decorator = utils_1.getComponentDecorator(node);
        var encapsulation = utils_1.getDecoratorPropertyInitializer(decorator, 'encapsulation');
        if (!encapsulation ||
            encapsulation.name.text !== 'None') {
            return;
        }
        this.addFailure(this.createFailure(encapsulation.getStart(), encapsulation.getWidth(), Rule.FAILURE));
    };
    return ViewEncapsulationWalker;
}(ngWalker_1.NgWalker));
