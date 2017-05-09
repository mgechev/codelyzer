"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var processFiles_1 = require("./processFiles");
var ARGS = require('minimist')(process.argv.slice(2));
var SRC = ARGS.src;
var BUILD_TYPE = process.env.BUILD_TYPE;
try {
    processFiles_1.processFiles(SRC, {
        regexp: /<%=\s*BUILD_TYPE\s*%>/g,
        replace: BUILD_TYPE
    });
}
catch (e) {
    console.error(e);
}
