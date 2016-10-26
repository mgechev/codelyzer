"use strict";
var web_linter_1 = require('./worker/web-linter');
var rules = require('codelyzer');
var rulesConfig = {
    'directive-selector-name': [true, 'camelCase'],
    'component-selector-name': [true, 'kebab-case'],
    'directive-selector-type': [true, 'attribute'],
    'component-selector-type': [true, 'element'],
    'use-input-property-decorator': true,
    'use-output-property-decorator': true,
    'use-host-property-decorator': true,
    'no-input-rename': true,
    'no-output-rename': true,
    'use-life-cycle-interface': true,
    'use-pipe-transform-interface': true,
    'component-class-suffix': true,
    'directive-class-suffix': true,
    'import-destructuring-spacing': true,
    'templates-use-public': true,
    'no-access-missing-member': true,
    'invoke-injectable': true,
    'no-unused-css': true
};
var ruleToClass = function (ruleName) {
    var result = ruleName.replace(/(\-\w)/g, function (m) { return m[1].toUpperCase(); }) + 'Rule';
    return result[0].toUpperCase() + result.slice(1, result.length);
};
var getRules = function (config) {
    return Object.keys(config).map(function (k) {
        var className = ruleToClass(k);
        var ruleConfig = config[k];
        return new rules[className](k, ruleConfig, []);
    });
};
var linter = new web_linter_1.WebLinter();
self.addEventListener('message', function (e) {
    var config = JSON.parse(e.data);
    linter.lint('file.ts', config.program, getRules(rulesConfig));
    var output = linter.getResult().output;
    self.postMessage(output);
    linter.reset();
});
//# sourceMappingURL=worker.js.map