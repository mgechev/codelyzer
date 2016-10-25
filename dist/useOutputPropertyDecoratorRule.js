"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var propertyDecoratorBase_1 = require('./propertyDecoratorBase');
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule(ruleName, value, disabledIntervals) {
        _super.call(this, {
            decoratorName: 'Output',
            propertyName: 'outputs',
            errorMessage: 'Use the @Output property decorator instead of the outputs property (https://goo.gl/U0lrdN)'
        }, ruleName, value, disabledIntervals);
    }
    return Rule;
}(propertyDecoratorBase_1.UsePropertyDecorator));
exports.Rule = Rule;
