"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var urlResolver_1 = require("./urlResolvers/urlResolver");
var pathResolver_1 = require("./urlResolvers/pathResolver");
var logger_1 = require("../util/logger");
var config_1 = require("./config");
var metadata_1 = require("./metadata");
var function_1 = require("../util/function");
var astQuery_1 = require("../util/astQuery");
var ngQuery_1 = require("../util/ngQuery");
var normalizeTransformed = function (t) {
    if (!t.map) {
        t.source = t.code;
    }
    return t;
};
var MetadataReader = (function () {
    function MetadataReader(_fileResolver, _urlResolver) {
        this._fileResolver = _fileResolver;
        this._urlResolver = _urlResolver;
        this._urlResolver = this._urlResolver || new urlResolver_1.UrlResolver(new pathResolver_1.PathResolver());
    }
    MetadataReader.prototype.read = function (d) {
        var _this = this;
        var componentMetadata = function_1.unwrapFirst((d.decorators || []).map(function (dec) {
            return function_1.Maybe.lift(dec).bind(astQuery_1.callExpression)
                .bind(astQuery_1.withIdentifier('Component'))
                .fmap(function () { return _this.readComponentMetadata(d, dec); });
        }));
        var directiveMetadata = function_1.unwrapFirst((d.decorators || []).map(function (dec) {
            return function_1.Maybe.lift(dec)
                .bind(astQuery_1.callExpression)
                .bind(astQuery_1.withIdentifier('Directive'))
                .fmap(function () { return _this.readDirectiveMetadata(d, dec); });
        }));
        return directiveMetadata || componentMetadata || undefined;
    };
    MetadataReader.prototype.readDirectiveMetadata = function (d, dec) {
        var selector = this.getDecoratorArgument(dec)
            .bind(function (expr) { return astQuery_1.getStringInitializerFromProperty('selector', expr.properties); })
            .fmap(function (initializer) { return initializer.text; });
        return Object.assign(new metadata_1.DirectiveMetadata(), {
            controller: d,
            decorator: dec,
            selector: selector.unwrap(),
        });
    };
    MetadataReader.prototype.readComponentMetadata = function (d, dec) {
        var _this = this;
        var expr = this.getDecoratorArgument(dec);
        var directiveMetadata = this.readDirectiveMetadata(d, dec);
        var external_M = expr.fmap(function () { return _this._urlResolver.resolve(dec); });
        var template_M = external_M.bind(function (external) {
            return _this.readComponentTemplateMetadata(dec, external);
        });
        var style_M = external_M.bind(function (external) {
            return _this.readComponentStylesMetadata(dec, external);
        });
        return Object.assign(new metadata_1.ComponentMetadata(), directiveMetadata, {
            template: template_M.unwrap(),
            styles: style_M.unwrap(),
        });
    };
    MetadataReader.prototype.getDecoratorArgument = function (decorator) {
        return astQuery_1.decoratorArgument(decorator)
            .bind(function_1.ifTrue(astQuery_1.hasProperties));
    };
    MetadataReader.prototype.readComponentTemplateMetadata = function (dec, external) {
        var _this = this;
        return ngQuery_1.getTemplate(dec)
            .fmap(function (inlineTemplate) { return ({
            template: normalizeTransformed(config_1.Config.transformTemplate(inlineTemplate.text, null, dec)),
            url: null,
            node: inlineTemplate,
        }); }).catch(function () {
            return function_1.Maybe.lift(external.templateUrl)
                .bind(function (url) {
                return _this._resolve(url).fmap(function (template) { return ({
                    template: normalizeTransformed(config_1.Config.transformTemplate(template, url, dec)),
                    url: url,
                    node: null
                }); });
            });
        });
    };
    MetadataReader.prototype.readComponentStylesMetadata = function (dec, external) {
        var _this = this;
        return ngQuery_1.getInlineStyle(dec).fmap(function (inlineStyles) {
            return inlineStyles.elements.map(function (inlineStyle) {
                if (astQuery_1.isSimpleTemplateString(inlineStyle)) {
                    return {
                        style: normalizeTransformed(config_1.Config.transformStyle(inlineStyle.text, null, dec)),
                        url: null,
                        node: inlineStyle,
                    };
                }
            }).filter(function (v) { return !!v; });
        }).catch(function () {
            return function_1.Maybe.lift(external.styleUrls)
                .fmap(function (urls) { return urls.map(function (url) {
                return _this._resolve(url).fmap(function (style) { return ({
                    style: normalizeTransformed(config_1.Config.transformStyle(style, url, dec)),
                    url: url,
                    node: null,
                }); });
            }); })
                .bind(function (url_Ms) { return function_1.listToMaybe(url_Ms); });
        });
    };
    MetadataReader.prototype._resolve = function (url) {
        try {
            return function_1.Maybe.lift(this._fileResolver.resolve(url));
        }
        catch (e) {
            logger_1.logger.info('Cannot read file' + url);
            return function_1.Maybe.nothing;
        }
    };
    return MetadataReader;
}());
exports.MetadataReader = MetadataReader;
