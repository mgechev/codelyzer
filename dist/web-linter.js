"use strict";
var ts = require('typescript');
var Linter = require('tslint/lib/lint');
function getSourceFile(fileName, source) {
    var normalizedName = fileName;
    var compilerOptions = createCompilerOptions();
    var compilerHost = {
        fileExists: function () { return true; },
        getCanonicalFileName: function (filename) { return filename; },
        getCurrentDirectory: function () { return ''; },
        getDefaultLibFileName: function () { return 'lib.d.ts'; },
        getDirectories: function (_path) { return []; },
        getNewLine: function () { return '\n'; },
        getSourceFile: function (filenameToGet) {
            if (filenameToGet === normalizedName) {
                return ts.createSourceFile(filenameToGet, source, compilerOptions.target, true);
            }
            return undefined;
        },
        readFile: function () { return null; },
        useCaseSensitiveFileNames: function () { return true; },
        writeFile: function () { return null; },
    };
    var program = ts.createProgram([normalizedName], compilerOptions, compilerHost);
    return program.getSourceFile(normalizedName);
}
exports.getSourceFile = getSourceFile;
function createCompilerOptions() {
    return {
        noResolve: true,
        target: ts.ScriptTarget.ES5,
    };
}
exports.createCompilerOptions = createCompilerOptions;
var WebLinter = (function () {
    function WebLinter() {
        this.failures = [];
    }
    WebLinter.prototype.lint = function (fileName, source, enabledRules) {
        var sourceFile = getSourceFile(fileName, source);
        if (sourceFile === undefined) {
            throw new Error("Invalid source file: " + fileName + ". Ensure that the files supplied to lint have a .ts or .tsx extension.");
        }
        for (var _i = 0, enabledRules_1 = enabledRules; _i < enabledRules_1.length; _i++) {
            var rule = enabledRules_1[_i];
            var ruleFailures = [];
            ruleFailures = rule.apply(sourceFile);
            for (var _a = 0, ruleFailures_1 = ruleFailures; _a < ruleFailures_1.length; _a++) {
                var ruleFailure = ruleFailures_1[_a];
                if (!this.containsRule(this.failures, ruleFailure)) {
                    this.failures.push(ruleFailure);
                }
            }
        }
    };
    WebLinter.prototype.getResult = function () {
        var formatter = new Linter.Formatters.JsonFormatter();
        var output = formatter.format(this.failures);
        return {
            failureCount: this.failures.length,
            failures: this.failures,
            format: 'json',
            output: output,
        };
    };
    WebLinter.prototype.reset = function () {
        this.failures.length = 0;
    };
    WebLinter.prototype.containsRule = function (rules, rule) {
        return rules.some(function (r) { return r.equals(rule); });
    };
    return WebLinter;
}());
exports.WebLinter = WebLinter;
//# sourceMappingURL=web-linter.js.map