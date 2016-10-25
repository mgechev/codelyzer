"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require('typescript');
var Lint = require('tslint/lib/lint');
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ImportDestructuringSpacingWalker(sourceFile, this.getOptions()));
    };
    Rule.FAILURE_STRING = 'You need to leave whitespaces inside of the import statement\'s curly braces (https://goo.gl/25R7qr)';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var ImportDestructuringSpacingWalker = (function (_super) {
    __extends(ImportDestructuringSpacingWalker, _super);
    function ImportDestructuringSpacingWalker(sourceFile, options) {
        _super.call(this, sourceFile, options);
        this.scanner = ts.createScanner(ts.ScriptTarget.ES5, false, ts.LanguageVariant.Standard, sourceFile.text);
    }
    ImportDestructuringSpacingWalker.prototype.visitImportDeclaration = function (node) {
        var importClause = node.importClause;
        if (importClause != null && importClause.namedBindings != null) {
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
}(Lint.SkippableTokenAwareRuleWalker));
