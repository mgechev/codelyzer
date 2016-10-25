"use strict";
exports.SelectorValidator = {
    attribute: function (selector) {
        return /^\[.+\]$/.test(selector);
    },
    element: function (selector) {
        return /^[^\[].+[^\]]$/.test(selector);
    },
    kebabCase: function (selector) {
        return /^[a-z0-9\-]+\-[a-z0-9\-]+$/.test(selector);
    },
    camelCase: function (selector) {
        return /^[a-zA-Z0-9\[\]]+$/.test(selector);
    },
    prefix: function (prefix) {
        return function (selector) {
            return new RegExp("^\\[?" + prefix).test(selector);
        };
    },
    multiPrefix: function (prefixes) {
        return function (selector) {
            return new RegExp("^\\[?(" + prefixes + ")").test(selector);
        };
    }
};
