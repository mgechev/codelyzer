"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var processFiles_1 = require("./processFiles");
var LINKS = require('../../style-guide-links/all.json');
var ARGS = require('minimist')(process.argv.slice(2));
var SRC = ARGS.src;
try {
    processFiles_1.processFiles(SRC, {
        regexp: /\$\$(\d\d-\d\d)\$\$/g,
        replace: function (substring, code) {
            var link = LINKS[code];
            if (link === undefined) {
                throw new Error('Non existing link for style #' + code);
            }
            return link;
        }
    });
}
catch (e) {
    console.error(e);
}
