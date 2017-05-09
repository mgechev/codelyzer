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
var Lint = require("tslint");
var ts = require("typescript");
var compiler = require("@angular/compiler");
var templateParser_1 = require("./templates/templateParser");
var parseCss_1 = require("./styles/parseCss");
var basicCssAstVisitor_1 = require("./styles/basicCssAstVisitor");
var basicTemplateAstVisitor_1 = require("./templates/basicTemplateAstVisitor");
var recursiveAngularExpressionVisitor_1 = require("./templates/recursiveAngularExpressionVisitor");
var referenceCollectorVisitor_1 = require("./templates/referenceCollectorVisitor");
var metadata_1 = require("./metadata");
var ngWalkerFactoryUtils_1 = require("./ngWalkerFactoryUtils");
var config_1 = require("./config");
var logger_1 = require("../util/logger");
var utils_1 = require("../util/utils");
var getDecoratorStringArgs = function (decorator) {
    var baseExpr = decorator.expression || {};
    var args = baseExpr.arguments || [];
    return args.map(function (a) { return (a.kind === ts.SyntaxKind.StringLiteral) ? a.text : null; });
};
var NgWalker = (function (_super) {
    __extends(NgWalker, _super);
    function NgWalker(sourceFile, _originalOptions, _config, _metadataReader) {
        var _this = _super.call(this, sourceFile, _originalOptions) || this;
        _this._originalOptions = _originalOptions;
        _this._config = _config;
        _this._metadataReader = _metadataReader;
        _this._metadataReader = _this._metadataReader || ngWalkerFactoryUtils_1.ngWalkerFactoryUtils.defaultMetadataReader();
        _this._config = Object.assign({
            templateVisitorCtrl: basicTemplateAstVisitor_1.BasicTemplateAstVisitor,
            expressionVisitorCtrl: recursiveAngularExpressionVisitor_1.RecursiveAngularExpressionVisitor,
            cssVisitorCtrl: basicCssAstVisitor_1.BasicCssAstVisitor
        }, _this._config || {});
        _this._config = Object.assign({
            templateVisitorCtrl: basicTemplateAstVisitor_1.BasicTemplateAstVisitor,
            expressionVisitorCtrl: recursiveAngularExpressionVisitor_1.RecursiveAngularExpressionVisitor,
            cssVisitorCtrl: basicCssAstVisitor_1.BasicCssAstVisitor
        }, _this._config || {});
        return _this;
    }
    NgWalker.prototype.visitClassDeclaration = function (declaration) {
        var metadata = this._metadataReader.read(declaration);
        if (metadata instanceof metadata_1.ComponentMetadata) {
            this.visitNgComponent(metadata);
        }
        else if (metadata instanceof metadata_1.DirectiveMetadata) {
            this.visitNgDirective(metadata);
        }
        (declaration.decorators || []).forEach(this.visitClassDecorator.bind(this));
        _super.prototype.visitClassDeclaration.call(this, declaration);
    };
    NgWalker.prototype.visitMethodDeclaration = function (method) {
        (method.decorators || []).forEach(this.visitMethodDecorator.bind(this));
        _super.prototype.visitMethodDeclaration.call(this, method);
    };
    NgWalker.prototype.visitPropertyDeclaration = function (prop) {
        (prop.decorators || []).forEach(this.visitPropertyDecorator.bind(this));
        _super.prototype.visitPropertyDeclaration.call(this, prop);
    };
    NgWalker.prototype.visitMethodDecorator = function (decorator) {
        var name = utils_1.getDecoratorName(decorator);
        if (name === 'HostListener') {
            this.visitNgHostListener(decorator.parent, decorator, getDecoratorStringArgs(decorator));
        }
    };
    NgWalker.prototype.visitPropertyDecorator = function (decorator) {
        var name = utils_1.getDecoratorName(decorator);
        switch (name) {
            case 'Input':
                this.visitNgInput(decorator.parent, decorator, getDecoratorStringArgs(decorator));
                break;
            case 'Output':
                this.visitNgOutput(decorator.parent, decorator, getDecoratorStringArgs(decorator));
                break;
            case 'HostBinding':
                this.visitNgHostBinding(decorator.parent, decorator, getDecoratorStringArgs(decorator));
                break;
        }
    };
    NgWalker.prototype.visitClassDecorator = function (decorator) {
        var name = utils_1.getDecoratorName(decorator);
        if (!decorator.expression.arguments ||
            !decorator.expression.arguments.length ||
            !decorator.expression.arguments[0].properties) {
            return;
        }
        if (name === 'Pipe') {
            this.visitNgPipe(decorator.parent, decorator);
        }
    };
    NgWalker.prototype.visitNgComponent = function (metadata) {
        var template = metadata.template;
        var getPosition = function (node) {
            var pos = 0;
            if (node) {
                pos = node.pos + 1;
                try {
                    pos = node.getStart() + 1;
                }
                catch (e) { }
            }
            return pos;
        };
        if (template && template.template) {
            try {
                var templateAst = templateParser_1.parseTemplate(template.template.code, config_1.Config.predefinedDirectives);
                this.visitNgTemplateHelper(templateAst, metadata, getPosition(template.node));
            }
            catch (e) {
                logger_1.logger.error('Cannot parse the template of', ((metadata.controller || {}).name || {}).text, e);
            }
        }
        var styles = metadata.styles;
        if (styles && styles.length) {
            for (var i = 0; i < styles.length; i += 1) {
                var style = styles[i];
                try {
                    this.visitNgStyleHelper(parseCss_1.parseCss(style.style.code), metadata, style, getPosition(style.node));
                }
                catch (e) {
                    logger_1.logger.error('Cannot parse the styles of', ((metadata.controller || {}).name || {}).text, e);
                }
            }
        }
    };
    NgWalker.prototype.visitNgDirective = function (metadata) { };
    NgWalker.prototype.visitNgPipe = function (controller, decorator) { };
    NgWalker.prototype.visitNgInput = function (property, input, args) { };
    NgWalker.prototype.visitNgOutput = function (property, output, args) { };
    NgWalker.prototype.visitNgHostBinding = function (property, decorator, args) { };
    NgWalker.prototype.visitNgHostListener = function (method, decorator, args) { };
    NgWalker.prototype.visitNgTemplateHelper = function (roots, context, baseStart) {
        var _this = this;
        if (!roots || !roots.length) {
            return;
        }
        else {
            var sourceFile = this.getContextSourceFile(context.template.url, context.template.template.source);
            var referenceVisitor = new referenceCollectorVisitor_1.ReferenceCollectorVisitor();
            var visitor = new this._config.templateVisitorCtrl(sourceFile, this._originalOptions, context, baseStart, this._config.expressionVisitorCtrl);
            compiler.templateVisitAll(referenceVisitor, roots, null);
            visitor._variables = referenceVisitor.variables;
            compiler.templateVisitAll(visitor, roots, context.controller);
            visitor.getFailures().forEach(function (f) { return _this.addFailure(f); });
        }
    };
    NgWalker.prototype.visitNgStyleHelper = function (style, context, styleMetadata, baseStart) {
        var _this = this;
        if (!style) {
            return;
        }
        else {
            var sourceFile = this.getContextSourceFile(styleMetadata.url, styleMetadata.style.source);
            var visitor = new this._config.cssVisitorCtrl(sourceFile, this._originalOptions, context, styleMetadata, baseStart);
            style.visit(visitor);
            visitor.getFailures().forEach(function (f) { return _this.addFailure(f); });
        }
    };
    NgWalker.prototype.getContextSourceFile = function (path, content) {
        var current = this.getSourceFile();
        if (!path) {
            return current;
        }
        return ts.createSourceFile(path, "`" + content + "`", ts.ScriptTarget.ES5);
    };
    return NgWalker;
}(Lint.RuleWalker));
exports.NgWalker = NgWalker;
