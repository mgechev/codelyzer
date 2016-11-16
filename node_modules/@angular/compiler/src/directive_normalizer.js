/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, ViewEncapsulation } from '@angular/core';
import { CompileStylesheetMetadata, CompileTemplateMetadata } from './compile_metadata';
import { CompilerConfig } from './config';
import { isBlank, isPresent, stringify } from './facade/lang';
import * as html from './ml_parser/ast';
import { HtmlParser } from './ml_parser/html_parser';
import { InterpolationConfig } from './ml_parser/interpolation_config';
import { ResourceLoader } from './resource_loader';
import { extractStyleUrls, isStyleUrlResolvable } from './style_url_resolver';
import { PreparsedElementType, preparseElement } from './template_parser/template_preparser';
import { UrlResolver } from './url_resolver';
import { SyncAsyncResult } from './util';
export var DirectiveNormalizer = (function () {
    function DirectiveNormalizer(_resourceLoader, _urlResolver, _htmlParser, _config) {
        this._resourceLoader = _resourceLoader;
        this._urlResolver = _urlResolver;
        this._htmlParser = _htmlParser;
        this._config = _config;
        this._resourceLoaderCache = new Map();
    }
    DirectiveNormalizer.prototype.clearCache = function () { this._resourceLoaderCache.clear(); };
    DirectiveNormalizer.prototype.clearCacheFor = function (normalizedDirective) {
        var _this = this;
        if (!normalizedDirective.isComponent) {
            return;
        }
        this._resourceLoaderCache.delete(normalizedDirective.template.templateUrl);
        normalizedDirective.template.externalStylesheets.forEach(function (stylesheet) { _this._resourceLoaderCache.delete(stylesheet.moduleUrl); });
    };
    DirectiveNormalizer.prototype._fetch = function (url) {
        var result = this._resourceLoaderCache.get(url);
        if (!result) {
            result = this._resourceLoader.get(url);
            this._resourceLoaderCache.set(url, result);
        }
        return result;
    };
    DirectiveNormalizer.prototype.normalizeTemplate = function (prenormData) {
        var _this = this;
        var normalizedTemplateSync = null;
        var normalizedTemplateAsync;
        if (isPresent(prenormData.template)) {
            normalizedTemplateSync = this.normalizeTemplateSync(prenormData);
            normalizedTemplateAsync = Promise.resolve(normalizedTemplateSync);
        }
        else if (prenormData.templateUrl) {
            normalizedTemplateAsync = this.normalizeTemplateAsync(prenormData);
        }
        else {
            throw new Error("No template specified for component " + stringify(prenormData.componentType));
        }
        if (normalizedTemplateSync && normalizedTemplateSync.styleUrls.length === 0) {
            // sync case
            return new SyncAsyncResult(normalizedTemplateSync);
        }
        else {
            // async case
            return new SyncAsyncResult(null, normalizedTemplateAsync.then(function (normalizedTemplate) { return _this.normalizeExternalStylesheets(normalizedTemplate); }));
        }
    };
    DirectiveNormalizer.prototype.normalizeTemplateSync = function (prenomData) {
        return this.normalizeLoadedTemplate(prenomData, prenomData.template, prenomData.moduleUrl);
    };
    DirectiveNormalizer.prototype.normalizeTemplateAsync = function (prenomData) {
        var _this = this;
        var templateUrl = this._urlResolver.resolve(prenomData.moduleUrl, prenomData.templateUrl);
        return this._fetch(templateUrl)
            .then(function (value) { return _this.normalizeLoadedTemplate(prenomData, value, templateUrl); });
    };
    DirectiveNormalizer.prototype.normalizeLoadedTemplate = function (prenomData, template, templateAbsUrl) {
        var interpolationConfig = InterpolationConfig.fromArray(prenomData.interpolation);
        var rootNodesAndErrors = this._htmlParser.parse(template, stringify(prenomData.componentType), false, interpolationConfig);
        if (rootNodesAndErrors.errors.length > 0) {
            var errorString = rootNodesAndErrors.errors.join('\n');
            throw new Error("Template parse errors:\n" + errorString);
        }
        var templateMetadataStyles = this.normalizeStylesheet(new CompileStylesheetMetadata({
            styles: prenomData.styles,
            styleUrls: prenomData.styleUrls,
            moduleUrl: prenomData.moduleUrl
        }));
        var visitor = new TemplatePreparseVisitor();
        html.visitAll(visitor, rootNodesAndErrors.rootNodes);
        var templateStyles = this.normalizeStylesheet(new CompileStylesheetMetadata({ styles: visitor.styles, styleUrls: visitor.styleUrls, moduleUrl: templateAbsUrl }));
        var encapsulation = prenomData.encapsulation;
        if (isBlank(encapsulation)) {
            encapsulation = this._config.defaultEncapsulation;
        }
        var styles = templateMetadataStyles.styles.concat(templateStyles.styles);
        var styleUrls = templateMetadataStyles.styleUrls.concat(templateStyles.styleUrls);
        if (encapsulation === ViewEncapsulation.Emulated && styles.length === 0 &&
            styleUrls.length === 0) {
            encapsulation = ViewEncapsulation.None;
        }
        return new CompileTemplateMetadata({
            encapsulation: encapsulation,
            template: template,
            templateUrl: templateAbsUrl, styles: styles, styleUrls: styleUrls,
            ngContentSelectors: visitor.ngContentSelectors,
            animations: prenomData.animations,
            interpolation: prenomData.interpolation,
        });
    };
    DirectiveNormalizer.prototype.normalizeExternalStylesheets = function (templateMeta) {
        return this._loadMissingExternalStylesheets(templateMeta.styleUrls)
            .then(function (externalStylesheets) { return new CompileTemplateMetadata({
            encapsulation: templateMeta.encapsulation,
            template: templateMeta.template,
            templateUrl: templateMeta.templateUrl,
            styles: templateMeta.styles,
            styleUrls: templateMeta.styleUrls,
            externalStylesheets: externalStylesheets,
            ngContentSelectors: templateMeta.ngContentSelectors,
            animations: templateMeta.animations,
            interpolation: templateMeta.interpolation
        }); });
    };
    DirectiveNormalizer.prototype._loadMissingExternalStylesheets = function (styleUrls, loadedStylesheets) {
        var _this = this;
        if (loadedStylesheets === void 0) { loadedStylesheets = new Map(); }
        return Promise
            .all(styleUrls.filter(function (styleUrl) { return !loadedStylesheets.has(styleUrl); })
            .map(function (styleUrl) { return _this._fetch(styleUrl).then(function (loadedStyle) {
            var stylesheet = _this.normalizeStylesheet(new CompileStylesheetMetadata({ styles: [loadedStyle], moduleUrl: styleUrl }));
            loadedStylesheets.set(styleUrl, stylesheet);
            return _this._loadMissingExternalStylesheets(stylesheet.styleUrls, loadedStylesheets);
        }); }))
            .then(function (_) { return Array.from(loadedStylesheets.values()); });
    };
    DirectiveNormalizer.prototype.normalizeStylesheet = function (stylesheet) {
        var _this = this;
        var allStyleUrls = stylesheet.styleUrls.filter(isStyleUrlResolvable)
            .map(function (url) { return _this._urlResolver.resolve(stylesheet.moduleUrl, url); });
        var allStyles = stylesheet.styles.map(function (style) {
            var styleWithImports = extractStyleUrls(_this._urlResolver, stylesheet.moduleUrl, style);
            allStyleUrls.push.apply(allStyleUrls, styleWithImports.styleUrls);
            return styleWithImports.style;
        });
        return new CompileStylesheetMetadata({ styles: allStyles, styleUrls: allStyleUrls, moduleUrl: stylesheet.moduleUrl });
    };
    DirectiveNormalizer.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    DirectiveNormalizer.ctorParameters = [
        { type: ResourceLoader, },
        { type: UrlResolver, },
        { type: HtmlParser, },
        { type: CompilerConfig, },
    ];
    return DirectiveNormalizer;
}());
var TemplatePreparseVisitor = (function () {
    function TemplatePreparseVisitor() {
        this.ngContentSelectors = [];
        this.styles = [];
        this.styleUrls = [];
        this.ngNonBindableStackCount = 0;
    }
    TemplatePreparseVisitor.prototype.visitElement = function (ast, context) {
        var preparsedElement = preparseElement(ast);
        switch (preparsedElement.type) {
            case PreparsedElementType.NG_CONTENT:
                if (this.ngNonBindableStackCount === 0) {
                    this.ngContentSelectors.push(preparsedElement.selectAttr);
                }
                break;
            case PreparsedElementType.STYLE:
                var textContent_1 = '';
                ast.children.forEach(function (child) {
                    if (child instanceof html.Text) {
                        textContent_1 += child.value;
                    }
                });
                this.styles.push(textContent_1);
                break;
            case PreparsedElementType.STYLESHEET:
                this.styleUrls.push(preparsedElement.hrefAttr);
                break;
            default:
                break;
        }
        if (preparsedElement.nonBindable) {
            this.ngNonBindableStackCount++;
        }
        html.visitAll(this, ast.children);
        if (preparsedElement.nonBindable) {
            this.ngNonBindableStackCount--;
        }
        return null;
    };
    TemplatePreparseVisitor.prototype.visitComment = function (ast, context) { return null; };
    TemplatePreparseVisitor.prototype.visitAttribute = function (ast, context) { return null; };
    TemplatePreparseVisitor.prototype.visitText = function (ast, context) { return null; };
    TemplatePreparseVisitor.prototype.visitExpansion = function (ast, context) { return null; };
    TemplatePreparseVisitor.prototype.visitExpansionCase = function (ast, context) { return null; };
    return TemplatePreparseVisitor;
}());
//# sourceMappingURL=directive_normalizer.js.map