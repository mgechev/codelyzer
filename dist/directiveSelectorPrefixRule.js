"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var selectorNameBase_1 = require('./selectorNameBase');
var selectorValidator_1 = require('./util/selectorValidator');
var FAILURE_SINGLE = 'The selector of the directive "%s" should have prefix "%s" (https://goo.gl/uacjKR)';
var FAILURE_MANY = 'The selector of the directive "%s" should have one of the prefixes: %s (https://goo.gl/uacjKR)';
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule(ruleName, value, disabledIntervals) {
        var prefixExpression = (value.slice(1) || []).join('|');
        var FAIL_MESSAGE = value.length > 2 ? FAILURE_MANY : FAILURE_SINGLE;
        _super.call(this, ruleName, value, disabledIntervals, selectorValidator_1.SelectorValidator.multiPrefix(prefixExpression), FAIL_MESSAGE, selectorNameBase_1.COMPONENT_TYPE.DIRECTIVE);
    }
    return Rule;
}(selectorNameBase_1.SelectorRule));
exports.Rule = Rule;
