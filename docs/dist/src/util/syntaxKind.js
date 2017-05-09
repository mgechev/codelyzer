"use strict";
var ts = require("typescript");
var SyntaxKind;
(function (SyntaxKind) {
    function current() {
        return ts.SyntaxKind;
    }
    SyntaxKind.current = current;
})(SyntaxKind || (SyntaxKind = {}));
module.exports = SyntaxKind;
