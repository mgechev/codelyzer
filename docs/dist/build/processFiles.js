"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var processFileContent = function (content, replacement) {
    return content.replace(replacement.regexp, replacement.replace);
};
exports.processFiles = function (path, replacement) {
    var files = fs_1.readdirSync(path);
    files.forEach(function (fileName) {
        var filePath = path_1.join(path, fileName);
        if (/\.js$/.test(fileName) && fs_1.lstatSync(filePath).isFile()) {
            fs_1.writeFileSync(filePath, processFileContent(fs_1.readFileSync(filePath).toString(), replacement));
        }
        else if (fs_1.lstatSync(filePath).isDirectory()) {
            exports.processFiles(filePath, replacement);
        }
    });
};
