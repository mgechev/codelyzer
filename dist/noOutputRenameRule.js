"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require('tslint/lib/lint');
var sprintf_js_1 = require('sprintf-js');
var ng2Walker_1 = require('./angular/ng2Walker');
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new OutputMetadataWalker(sourceFile, this.getOptions()));
    };
    Rule.FAILURE_STRING = 'In the class "%s", the directive output ' +
        'property "%s" should not be renamed.' +
        'Please, consider the following use "@Output() %s = new EventEmitter();"';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var OutputMetadataWalker = (function (_super) {
    __extends(OutputMetadataWalker, _super);
    function OutputMetadataWalker() {
        _super.apply(this, arguments);
    }
    OutputMetadataWalker.prototype.visitNg2Output = function (property, output, args) {
        var className = property.parent.name.text;
        var memberName = property.name.text;
        if (args.length !== 0 && memberName !== args[0]) {
            var failureConfig = [className, memberName, memberName];
            failureConfig.unshift(Rule.FAILURE_STRING);
            this.addFailure(this.createFailure(property.getStart(), property.getWidth(), sprintf_js_1.sprintf.apply(this, failureConfig)));
        }
    };
    return OutputMetadataWalker;
}(ng2Walker_1.Ng2Walker));
exports.OutputMetadataWalker = OutputMetadataWalker;
