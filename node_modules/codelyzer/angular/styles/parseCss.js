"use strict";
var cssParser_1 = require("./cssParser");
exports.parseCss = function (text) {
    var parser = new cssParser_1.CssParser();
    return parser.parse(text, '').ast;
};
