"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var propertyDecoratorBase_1 = require("./propertyDecoratorBase");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule(ruleName, value, disabledIntervals) {
        return _super.call(this, {
            decoratorName: ['HostBindings', 'HostListeners'],
            propertyName: 'host',
            errorMessage: 'Use @HostBindings and @HostListeners instead of the host property (https://goo.gl/zrdmKr)'
        }, ruleName, value, disabledIntervals) || this;
    }
    return Rule;
}(propertyDecoratorBase_1.UsePropertyDecorator));
exports.Rule = Rule;
