"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var glob = require("glob");
var stringify = require("json-stringify-pretty-compact");
var yaml = require("js-yaml");
var path = require("path");
var DOCS_DIR = '../docs';
process.chdir('./build');
var ruleDocumentation = {
    dataFileName: 'rules.json',
    exportName: 'Rule',
    globPattern: '../dist/src/*Rule.js',
    nameMetadataKey: 'ruleName',
    pageGenerator: generateRuleFile,
    subDirectory: path.join(DOCS_DIR, 'rules'),
};
var formatterDocumentation = {
    dataFileName: 'formatters.json',
    exportName: 'Formatter',
    globPattern: '../lib/formatters/*Formatter.js',
    nameMetadataKey: 'formatterName',
    pageGenerator: generateFormatterFile,
    subDirectory: path.join(DOCS_DIR, 'formatters'),
};
function buildDocumentation(documentation) {
    var paths = glob.sync(documentation.globPattern);
    var metadataJson = paths.map(function (path) {
        return buildSingleModuleDocumentation(documentation, path);
    });
    buildDocumentationDataFile(documentation, metadataJson);
}
function buildSingleModuleDocumentation(documentation, modulePath) {
    var module = require(modulePath);
    var DocumentedItem = module[documentation.exportName];
    if (DocumentedItem !== null && DocumentedItem.metadata !== null) {
        var metadata = DocumentedItem.metadata;
        var fileData = documentation.pageGenerator(metadata);
        var moduleName = metadata[documentation.nameMetadataKey];
        var fileDirectory = path.join(documentation.subDirectory, moduleName);
        if (!fs.existsSync(documentation.subDirectory)) {
            fs.mkdirSync(documentation.subDirectory);
        }
        if (!fs.existsSync(fileDirectory)) {
            fs.mkdirSync(fileDirectory);
        }
        fs.writeFileSync(path.join(fileDirectory, 'index.html'), fileData);
        return metadata;
    }
}
function buildDocumentationDataFile(documentation, metadataJson) {
    var dataJson = JSON.stringify(metadataJson, undefined, 2);
    fs.writeFileSync(path.join(DOCS_DIR, '_data', documentation.dataFileName), dataJson);
}
function generateJekyllData(metadata, layout, type, name) {
    return __assign({}, metadata, { layout: layout, title: type + ": " + name });
}
function generateRuleFile(metadata) {
    if (metadata.optionExamples) {
        metadata = __assign({}, metadata);
        metadata.optionExamples = metadata.optionExamples.map(function (example) {
            return typeof example === 'string' ? example : stringify(example);
        });
    }
    var yamlData = generateJekyllData(metadata, 'rule', 'Rule', metadata.ruleName);
    yamlData.optionsJSON = JSON.stringify(metadata.options, undefined, 2);
    return "---\n" + yaml.safeDump(yamlData, { lineWidth: 140 }) + "---";
}
function generateFormatterFile(metadata) {
    var yamlData = generateJekyllData(metadata, 'formatter', 'TSLint formatter', metadata.formatterName);
    return "---\n" + yaml.safeDump(yamlData, { lineWidth: 140 }) + "---";
}
buildDocumentation(ruleDocumentation);
buildDocumentation(formatterDocumentation);
