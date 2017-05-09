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
var selectorNameBase_1 = require("./selectorNameBase");
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleType = 'Component';
        return _this;
    }
    Rule.prototype.getTypeFailure = function () { return 'The selector of the component "%s" should be used as %s ($$05-03$$)'; };
    Rule.prototype.getStyleFailure = function () { return 'The selector of the component "%s" should be named %s ($$05-02$$)'; };
    Rule.prototype.getPrefixFailure = function (prefixes) {
        if (prefixes.length === 1) {
            return 'The selector of the component "%s" should have prefix "%s" ($$02-07$$)';
        }
        else {
            return 'The selector of the component "%s" should have one of the prefixes "%s" ($$02-07$$)';
        }
    };
    return Rule;
}(selectorNameBase_1.SelectorRule));
Rule.metadata = {
    ruleName: 'component-selector',
    type: 'style',
    description: "Component selectors should follow given naming rules.",
    descriptionDetails: "See more at https://angular.io/styleguide#!#02-07, https://angular.io/styleguide#!#05-02, " +
        "and https://angular.io/styleguide#!#05-03.",
    rationale: (_a = ["\n    * Consistent conventions make it easy to quickly identify and reference assets of different types.\n    * Makes it easier to promote and share the component in other apps.\n    * Components are easy to identify in the DOM.\n    * Keeps the element names consistent with the specification for Custom Elements.\n    * Components have templates containing HTML and optional Angular template syntax.\n        * They display content. Developers place components on the page as they would native HTML elements and WebComponents.\n    * It is easier to recognize that a symbol is a component by looking at the template's HTML.\n    "], _a.raw = ["\n    * Consistent conventions make it easy to quickly identify and reference assets of different types.\n    * Makes it easier to promote and share the component in other apps.\n    * Components are easy to identify in the DOM.\n    * Keeps the element names consistent with the specification for Custom Elements.\n    * Components have templates containing HTML and optional Angular template syntax.\n        * They display content. Developers place components on the page as they would native HTML elements and WebComponents.\n    * It is easier to recognize that a symbol is a component by looking at the template's HTML.\n    "], Lint.Utils.dedent(_a)),
    options: {
        'type': 'array',
        'items': [
            {
                'enum': ['element', 'attribute']
            },
            {
                'oneOf': [
                    {
                        'type': 'array',
                        'items': {
                            'type': 'string'
                        }
                    },
                    {
                        'type': 'string'
                    }
                ]
            },
            {
                'enum': ['kebab-case', 'camelCase']
            }
        ],
        'minItems': 3,
        'maxItems': 3
    },
    optionExamples: [
        "[\"element\", \"my-prefix\", \"kebab-case\"]",
        "[\"element\", [\"ng\", \"ngx\"], \"kebab-case\"]",
        "[\"attribute\", \"myPrefix\", \"camelCase\"]",
    ],
    optionsDescription: (_b = ["\n    Options accept three obligatory items as an array:\n\n    1. `\"element\"` or `\"attribute\"` forces components either to be elements or attributes.\n    2. A single prefix (string) or array of prefixes (strings) which have to be used in component selectors.\n    3. `\"kebab-case\"` or `\"camelCase\"` allows you to pick a case.\n    "], _b.raw = ["\n    Options accept three obligatory items as an array:\n\n    1. \\`\"element\"\\` or \\`\"attribute\"\\` forces components either to be elements or attributes.\n    2. A single prefix (string) or array of prefixes (strings) which have to be used in component selectors.\n    3. \\`\"kebab-case\"\\` or \\`\"camelCase\"\\` allows you to pick a case.\n    "], Lint.Utils.dedent(_b)),
    typescriptOnly: true,
};
exports.Rule = Rule;
var _a, _b;
