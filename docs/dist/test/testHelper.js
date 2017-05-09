"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslint = require("tslint");
var chai = require("chai");
function lint(ruleName, source, options) {
    var configuration = {
        extends: [],
        rules: new Map(),
        jsRules: new Map(),
        rulesDirectory: []
    };
    if (!options) {
        options = [];
    }
    var ops = { ruleName: ruleName, ruleArguments: options, disabledIntervals: [] };
    configuration.rules.set(ruleName, ops);
    var linterOptions = {
        formatter: 'json',
        rulesDirectory: './dist/src',
        formattersDirectory: null,
        fix: false
    };
    var linter = new tslint.Linter(linterOptions, undefined);
    linter.lint('file.ts', source, configuration);
    return linter.getResult();
}
var parseInvalidSource = function (source, message, specialChar, otherChars) {
    if (specialChar === void 0) { specialChar = '~'; }
    if (otherChars === void 0) { otherChars = []; }
    otherChars.forEach(function (char) { return source.replace(new RegExp(char, 'g'), ' '); });
    var start = null;
    var end;
    var line = 0;
    var col = 0;
    var lastCol = 0;
    var lastLine = 0;
    for (var i = 0; i < source.length; i += 1) {
        if (source[i] === specialChar && source[i - 1] !== '/' && start === null) {
            start = {
                line: line - 1,
                character: col
            };
        }
        if (source[i] === '\n') {
            col = 0;
            line += 1;
        }
        else {
            col += 1;
        }
        if (source[i] === specialChar && source[i - 1] !== '/') {
            lastCol = col;
            lastLine = line - 1;
        }
    }
    end = {
        line: lastLine,
        character: lastCol
    };
    source = source.replace(new RegExp(specialChar, 'g'), '');
    return {
        source: source,
        failure: {
            message: message,
            startPosition: start,
            endPosition: end
        }
    };
};
function assertAnnotated(config) {
    if (config.message) {
        var parsed = parseInvalidSource(config.source, config.message);
        return assertFailure(config.ruleName, parsed.source, parsed.failure, config.options);
    }
    else {
        return assertSuccess(config.ruleName, config.source, config.options);
    }
}
exports.assertAnnotated = assertAnnotated;
function assertMultipleAnnotated(configs) {
    configs.failures.forEach(function (failure, index) {
        var otherCharacters = configs.failures.map(function (message) { return message.char; }).filter(function (x) { return x !== failure.char; });
        if (failure.msg) {
            var parsed = parseInvalidSource(configs.source, failure.msg, failure.char, otherCharacters);
            assertFailure(configs.ruleName, parsed.source, parsed.failure, configs.options, index);
        }
        else {
            assertSuccess(configs.ruleName, configs.source, configs.options);
        }
    });
}
exports.assertMultipleAnnotated = assertMultipleAnnotated;
function assertFailure(ruleName, source, fail, options, onlyNthFailure) {
    if (options === void 0) { options = null; }
    if (onlyNthFailure === void 0) { onlyNthFailure = 0; }
    var result;
    try {
        result = lint(ruleName, source, options);
    }
    catch (e) {
        console.log(e.stack);
    }
    chai.assert(result.failures && result.failures.length > 0, 'no failures');
    var ruleFail = result.failures[onlyNthFailure];
    chai.assert.equal(fail.message, ruleFail.getFailure(), "error messages don't match");
    chai.assert.deepEqual(fail.startPosition, ruleFail.getStartPosition().getLineAndCharacter(), "start char doesn't match");
    chai.assert.deepEqual(fail.endPosition, ruleFail.getEndPosition().getLineAndCharacter(), "end char doesn't match");
    if (result) {
        return result.failures;
    }
    return undefined;
}
exports.assertFailure = assertFailure;
function assertFailures(ruleName, source, fails, options) {
    if (options === void 0) { options = null; }
    var result;
    try {
        result = lint(ruleName, source, options);
    }
    catch (e) {
        console.log(e.stack);
    }
    chai.assert(result.failures && result.failures.length > 0, 'no failures');
    result.failures.forEach(function (ruleFail, index) {
        chai.assert.equal(fails[index].message, ruleFail.getFailure(), "error messages don't match");
        chai.assert.deepEqual(fails[index].startPosition, ruleFail.getStartPosition().getLineAndCharacter(), "start char doesn't match");
        chai.assert.deepEqual(fails[index].endPosition, ruleFail.getEndPosition().getLineAndCharacter(), "end char doesn't match");
    });
}
exports.assertFailures = assertFailures;
function assertSuccess(ruleName, source, options) {
    if (options === void 0) { options = null; }
    var result = lint(ruleName, source, options);
    chai.assert.isTrue(result && result.failures.length === 0);
}
exports.assertSuccess = assertSuccess;
