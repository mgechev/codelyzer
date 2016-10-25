"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var selectorNameBase_1 = require('./selectorNameBase');
var selectorValidator_1 = require('./util/selectorValidator');
var FAILURE_STRING = 'The selector of the component "%s" should be named %s (https://goo.gl/mBg67Z)';
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule(ruleName, value, disabledIntervals) {
        var validator = selectorValidator_1.SelectorValidator.camelCase;
        if (value[1] === 'kebab-case') {
            validator = selectorValidator_1.SelectorValidator.kebabCase;
        }
        _super.call(this, ruleName, value, disabledIntervals, validator, FAILURE_STRING, selectorNameBase_1.COMPONENT_TYPE.COMPONENT);
    }
    return Rule;
}(selectorNameBase_1.SelectorRule));
exports.Rule = Rule;
