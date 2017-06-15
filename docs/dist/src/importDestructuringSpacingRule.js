"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ImportDestructuringSpacingWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.metadata = {
    ruleName: 'import-destructing-spacing',
    type: 'style',
    description: "Ensure consistent and tidy imports.",
    rationale: "Imports are easier for the reader to look at when they're tidy.",
    options: null,
    optionsDescription: "Not configurable.",
    typescriptOnly: true,
};
Rule.FAILURE_STRING = 'You need to leave whitespaces inside of the import statement\'s curly braces';
exports.Rule = Rule;
var ImportDestructuringSpacingWalker = (function (_super) {
    __extends(ImportDestructuringSpacingWalker, _super);
    function ImportDestructuringSpacingWalker(sourceFile, options) {
        var _this = _super.call(this, sourceFile, options) || this;
        _this.scanner = ts.createScanner(ts.ScriptTarget.ES5, false, ts.LanguageVariant.Standard, sourceFile.text);
        return _this;
    }
    ImportDestructuringSpacingWalker.prototype.visitImportDeclaration = function (node) {
        var importClause = node.importClause;
        if (importClause && importClause.namedBindings) {
            var text = importClause.namedBindings.getText();
            if (!this.checkForWhiteSpace(text)) {
                this.addFailure(this.createFailure(importClause.namedBindings.getStart(), importClause.namedBindings.getWidth(), Rule.FAILURE_STRING));
            }
        }
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    ImportDestructuringSpacingWalker.prototype.checkForWhiteSpace = function (text) {
        if (/\s*\*\s+as\s+[^\s]/.test(text)) {
            return true;
        }
        return /{\s[^]*\s}/.test(text);
    };
    return ImportDestructuringSpacingWalker;
}(Lint.RuleWalker));
