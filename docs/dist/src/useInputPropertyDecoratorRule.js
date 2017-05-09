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
var propertyDecoratorBase_1 = require("./propertyDecoratorBase");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule(options) {
        return _super.call(this, {
            decoratorName: 'Input',
            propertyName: 'inputs',
            errorMessage: 'Use the @Input property decorator instead of the inputs property ($$05-12$$)'
        }, options) || this;
    }
    return Rule;
}(propertyDecoratorBase_1.UsePropertyDecorator));
Rule.metadata = {
    ruleName: 'use-input-property-decorator-rule',
    type: 'style',
    description: "Use `@Input` decorator rather than the `inputs` property of `@Component` and `@Directive` metadata.",
    descriptionDetails: "See more at https://angular.io/styleguide#!#05-12.",
    rationale: (_a = ["\n    * It is easier and more readable to identify which properties in a class are inputs.\n    * If you ever need to rename the property name associated with `@Input`, you can modify it in a single place.\n    * The metadata declaration attached to the directive is shorter and thus more readable.\n    * Placing the decorator on the same line usually makes for shorter code and still easily identifies the property as an input."], _a.raw = ["\n    * It is easier and more readable to identify which properties in a class are inputs.\n    * If you ever need to rename the property name associated with \\`@Input\\`, you can modify it in a single place.\n    * The metadata declaration attached to the directive is shorter and thus more readable.\n    * Placing the decorator on the same line usually makes for shorter code and still easily identifies the property as an input."], Lint.Utils.dedent(_a)),
    options: null,
    optionsDescription: "Not configurable.",
    typescriptOnly: true,
};
exports.Rule = Rule;
var _a;
