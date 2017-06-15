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
var propertyDecoratorBase_1 = require("./propertyDecoratorBase");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule(options) {
        return _super.call(this, {
            decoratorName: ['HostBindings', 'HostListeners'],
            propertyName: 'host',
            errorMessage: 'Use @HostBindings and @HostListeners instead of the host property ($$06-03$$)'
        }, options) || this;
    }
    return Rule;
}(propertyDecoratorBase_1.UsePropertyDecorator));
Rule.metadata = {
    ruleName: 'use-host-property-decorator',
    type: 'style',
    description: "Use @HostProperty decorator rather than the `host` property of `@Component` and `@Directive` metadata.",
    descriptionDetails: "See more at https://angular.io/styleguide#!#06-03.",
    rationale: "The property associated with `@HostBinding` or the method associated with `@HostListener` " +
        "can be modified only in a single place: in the directive's class. If you use the `host` metadata " +
        "property, you must modify both the property declaration inside the controller, and the metadata " +
        "associated with the directive.",
    options: null,
    optionsDescription: "Not configurable.",
    typescriptOnly: true,
};
exports.Rule = Rule;
