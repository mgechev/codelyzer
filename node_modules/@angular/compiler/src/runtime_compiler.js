/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Compiler, ComponentFactory, Injectable, Injector, ModuleWithComponentFactories } from '@angular/core';
import { AnimationCompiler } from './animation/animation_compiler';
import { AnimationParser } from './animation/animation_parser';
import { ProviderMeta, createHostComponentMeta } from './compile_metadata';
import { CompilerConfig } from './config';
import { DirectiveWrapperCompiler } from './directive_wrapper_compiler';
import { stringify } from './facade/lang';
import { CompileMetadataResolver } from './metadata_resolver';
import { NgModuleCompiler } from './ng_module_compiler';
import * as ir from './output/output_ast';
import { interpretStatements } from './output/output_interpreter';
import { jitStatements } from './output/output_jit';
import { StyleCompiler } from './style_compiler';
import { TemplateParser } from './template_parser/template_parser';
import { SyncAsyncResult } from './util';
import { ComponentFactoryDependency, DirectiveWrapperDependency, ViewClassDependency, ViewCompiler } from './view_compiler/view_compiler';
/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 *
 * @security  When compiling templates at runtime, you must ensure that the entire template comes
 * from a trusted source. Attacker-controlled data introduced by a template could expose your
 * application to XSS risks.  For more detail, see the [Security Guide](http://g.co/ng/security).
 */
export var RuntimeCompiler = (function () {
    function RuntimeCompiler(_injector, _metadataResolver, _templateParser, _styleCompiler, _viewCompiler, _ngModuleCompiler, _directiveWrapperCompiler, _compilerConfig, _animationParser) {
        this._injector = _injector;
        this._metadataResolver = _metadataResolver;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._ngModuleCompiler = _ngModuleCompiler;
        this._directiveWrapperCompiler = _directiveWrapperCompiler;
        this._compilerConfig = _compilerConfig;
        this._animationParser = _animationParser;
        this._compiledTemplateCache = new Map();
        this._compiledHostTemplateCache = new Map();
        this._compiledDirectiveWrapperCache = new Map();
        this._compiledNgModuleCache = new Map();
        this._animationCompiler = new AnimationCompiler();
    }
    Object.defineProperty(RuntimeCompiler.prototype, "injector", {
        get: function () { return this._injector; },
        enumerable: true,
        configurable: true
    });
    RuntimeCompiler.prototype.compileModuleSync = function (moduleType) {
        return this._compileModuleAndComponents(moduleType, true).syncResult;
    };
    RuntimeCompiler.prototype.compileModuleAsync = function (moduleType) {
        return this._compileModuleAndComponents(moduleType, false).asyncResult;
    };
    RuntimeCompiler.prototype.compileModuleAndAllComponentsSync = function (moduleType) {
        return this._compileModuleAndAllComponents(moduleType, true).syncResult;
    };
    RuntimeCompiler.prototype.compileModuleAndAllComponentsAsync = function (moduleType) {
        return this._compileModuleAndAllComponents(moduleType, false).asyncResult;
    };
    RuntimeCompiler.prototype._compileModuleAndComponents = function (moduleType, isSync) {
        var _this = this;
        var loadingPromise = this._loadModules(moduleType, isSync);
        var createResult = function () {
            _this._compileComponents(moduleType, null);
            return _this._compileModule(moduleType);
        };
        if (isSync) {
            return new SyncAsyncResult(createResult());
        }
        else {
            return new SyncAsyncResult(null, loadingPromise.then(createResult));
        }
    };
    RuntimeCompiler.prototype._compileModuleAndAllComponents = function (moduleType, isSync) {
        var _this = this;
        var loadingPromise = this._loadModules(moduleType, isSync);
        var createResult = function () {
            var componentFactories = [];
            _this._compileComponents(moduleType, componentFactories);
            return new ModuleWithComponentFactories(_this._compileModule(moduleType), componentFactories);
        };
        if (isSync) {
            return new SyncAsyncResult(createResult());
        }
        else {
            return new SyncAsyncResult(null, loadingPromise.then(createResult));
        }
    };
    RuntimeCompiler.prototype._loadModules = function (mainModule, isSync) {
        var _this = this;
        var loadingPromises = [];
        var _a = this._metadataResolver.loadNgModuleMetadata(mainModule, isSync), ngModule = _a.ngModule, loading = _a.loading;
        loadingPromises.push(loading);
        // Note: the loadingPromise for a module only includes the loading of the exported directives
        // of imported modules.
        // However, for runtime compilation, we want to transitively compile all modules,
        // so we also need to call loadNgModuleMetadata for all nested modules.
        ngModule.transitiveModule.modules.forEach(function (localModuleMeta) {
            loadingPromises.push(_this._metadataResolver.loadNgModuleMetadata(localModuleMeta.type.reference, isSync)
                .loading);
        });
        return Promise.all(loadingPromises);
    };
    RuntimeCompiler.prototype._compileModule = function (moduleType) {
        var _this = this;
        var ngModuleFactory = this._compiledNgModuleCache.get(moduleType);
        if (!ngModuleFactory) {
            var moduleMeta_1 = this._metadataResolver.getNgModuleMetadata(moduleType);
            // Always provide a bound Compiler
            var extraProviders = [this._metadataResolver.getProviderMetadata(new ProviderMeta(Compiler, { useFactory: function () { return new ModuleBoundCompiler(_this, moduleMeta_1.type.reference); } }))];
            var compileResult = this._ngModuleCompiler.compile(moduleMeta_1, extraProviders);
            compileResult.dependencies.forEach(function (dep) {
                dep.placeholder.reference =
                    _this._assertComponentKnown(dep.comp.reference, true).proxyComponentFactory;
                dep.placeholder.name = "compFactory_" + dep.comp.name;
            });
            if (!this._compilerConfig.useJit) {
                ngModuleFactory =
                    interpretStatements(compileResult.statements, compileResult.ngModuleFactoryVar);
            }
            else {
                ngModuleFactory = jitStatements("/" + moduleMeta_1.type.name + "/module.ngfactory.js", compileResult.statements, compileResult.ngModuleFactoryVar);
            }
            this._compiledNgModuleCache.set(moduleMeta_1.type.reference, ngModuleFactory);
        }
        return ngModuleFactory;
    };
    /**
     * @internal
     */
    RuntimeCompiler.prototype._compileComponents = function (mainModule, allComponentFactories) {
        var _this = this;
        var ngModule = this._metadataResolver.getNgModuleMetadata(mainModule);
        var moduleByDirective = new Map();
        var templates = new Set();
        ngModule.transitiveModule.modules.forEach(function (localModuleSummary) {
            var localModuleMeta = _this._metadataResolver.getNgModuleMetadata(localModuleSummary.type.reference);
            localModuleMeta.declaredDirectives.forEach(function (dirIdentifier) {
                moduleByDirective.set(dirIdentifier.reference, localModuleMeta);
                var dirMeta = _this._metadataResolver.getDirectiveMetadata(dirIdentifier.reference);
                _this._compileDirectiveWrapper(dirMeta, localModuleMeta);
                if (dirMeta.isComponent) {
                    templates.add(_this._createCompiledTemplate(dirMeta, localModuleMeta));
                    if (allComponentFactories) {
                        var template = _this._createCompiledHostTemplate(dirMeta.type.reference, localModuleMeta);
                        templates.add(template);
                        allComponentFactories.push(template.proxyComponentFactory);
                    }
                }
            });
        });
        ngModule.transitiveModule.modules.forEach(function (localModuleSummary) {
            var localModuleMeta = _this._metadataResolver.getNgModuleMetadata(localModuleSummary.type.reference);
            localModuleMeta.declaredDirectives.forEach(function (dirIdentifier) {
                var dirMeta = _this._metadataResolver.getDirectiveMetadata(dirIdentifier.reference);
                if (dirMeta.isComponent) {
                    dirMeta.entryComponents.forEach(function (entryComponentType) {
                        var moduleMeta = moduleByDirective.get(entryComponentType.reference);
                        templates.add(_this._createCompiledHostTemplate(entryComponentType.reference, moduleMeta));
                    });
                }
            });
            localModuleMeta.entryComponents.forEach(function (entryComponentType) {
                var moduleMeta = moduleByDirective.get(entryComponentType.reference);
                templates.add(_this._createCompiledHostTemplate(entryComponentType.reference, moduleMeta));
            });
        });
        templates.forEach(function (template) { return _this._compileTemplate(template); });
    };
    RuntimeCompiler.prototype.clearCacheFor = function (type) {
        this._compiledNgModuleCache.delete(type);
        this._metadataResolver.clearCacheFor(type);
        this._compiledHostTemplateCache.delete(type);
        var compiledTemplate = this._compiledTemplateCache.get(type);
        if (compiledTemplate) {
            this._compiledTemplateCache.delete(type);
        }
    };
    RuntimeCompiler.prototype.clearCache = function () {
        this._metadataResolver.clearCache();
        this._compiledTemplateCache.clear();
        this._compiledHostTemplateCache.clear();
        this._compiledNgModuleCache.clear();
    };
    RuntimeCompiler.prototype._createCompiledHostTemplate = function (compType, ngModule) {
        if (!ngModule) {
            throw new Error("Component " + stringify(compType) + " is not part of any NgModule or the module has not been imported into your module.");
        }
        var compiledTemplate = this._compiledHostTemplateCache.get(compType);
        if (!compiledTemplate) {
            var compMeta = this._metadataResolver.getDirectiveMetadata(compType);
            assertComponent(compMeta);
            var hostMeta = createHostComponentMeta(compMeta);
            compiledTemplate = new CompiledTemplate(true, compMeta.selector, compMeta.type, hostMeta, ngModule, [compMeta.type]);
            this._compiledHostTemplateCache.set(compType, compiledTemplate);
        }
        return compiledTemplate;
    };
    RuntimeCompiler.prototype._createCompiledTemplate = function (compMeta, ngModule) {
        var compiledTemplate = this._compiledTemplateCache.get(compMeta.type.reference);
        if (!compiledTemplate) {
            assertComponent(compMeta);
            compiledTemplate = new CompiledTemplate(false, compMeta.selector, compMeta.type, compMeta, ngModule, ngModule.transitiveModule.directives);
            this._compiledTemplateCache.set(compMeta.type.reference, compiledTemplate);
        }
        return compiledTemplate;
    };
    RuntimeCompiler.prototype._assertComponentKnown = function (compType, isHost) {
        var compiledTemplate = isHost ? this._compiledHostTemplateCache.get(compType) :
            this._compiledTemplateCache.get(compType);
        if (!compiledTemplate) {
            throw new Error("Illegal state: Compiled view for component " + stringify(compType) + " (host: " + isHost + ") does not exist!");
        }
        return compiledTemplate;
    };
    RuntimeCompiler.prototype._assertDirectiveWrapper = function (dirType) {
        var dirWrapper = this._compiledDirectiveWrapperCache.get(dirType);
        if (!dirWrapper) {
            throw new Error("Illegal state: Directive wrapper for " + stringify(dirType) + " has not been compiled!");
        }
        return dirWrapper;
    };
    RuntimeCompiler.prototype._compileDirectiveWrapper = function (dirMeta, moduleMeta) {
        var compileResult = this._directiveWrapperCompiler.compile(dirMeta);
        var statements = compileResult.statements;
        var directiveWrapperClass;
        if (!this._compilerConfig.useJit) {
            directiveWrapperClass = interpretStatements(statements, compileResult.dirWrapperClassVar);
        }
        else {
            directiveWrapperClass = jitStatements("/" + moduleMeta.type.name + "/" + dirMeta.type.name + "/wrapper.ngfactory.js", statements, compileResult.dirWrapperClassVar);
        }
        this._compiledDirectiveWrapperCache.set(dirMeta.type.reference, directiveWrapperClass);
    };
    RuntimeCompiler.prototype._compileTemplate = function (template) {
        var _this = this;
        if (template.isCompiled) {
            return;
        }
        var compMeta = template.compMeta;
        var externalStylesheetsByModuleUrl = new Map();
        var stylesCompileResult = this._styleCompiler.compileComponent(compMeta);
        stylesCompileResult.externalStylesheets.forEach(function (r) { externalStylesheetsByModuleUrl.set(r.meta.moduleUrl, r); });
        this._resolveStylesCompileResult(stylesCompileResult.componentStylesheet, externalStylesheetsByModuleUrl);
        var parsedAnimations = this._animationParser.parseComponent(compMeta);
        var directives = template.directives.map(function (dir) { return _this._metadataResolver.getDirectiveSummary(dir.reference); });
        var pipes = template.ngModule.transitiveModule.pipes.map(function (pipe) { return _this._metadataResolver.getPipeSummary(pipe.reference); });
        var parsedTemplate = this._templateParser.parse(compMeta, compMeta.template.template, directives, pipes, template.ngModule.schemas, compMeta.type.name);
        var compiledAnimations = this._animationCompiler.compile(compMeta.type.name, parsedAnimations);
        var compileResult = this._viewCompiler.compileComponent(compMeta, parsedTemplate, ir.variable(stylesCompileResult.componentStylesheet.stylesVar), pipes, compiledAnimations);
        compileResult.dependencies.forEach(function (dep) {
            var depTemplate;
            if (dep instanceof ViewClassDependency) {
                var vfd = dep;
                depTemplate = _this._assertComponentKnown(vfd.comp.reference, false);
                vfd.placeholder.reference = depTemplate.proxyViewClass;
                vfd.placeholder.name = "View_" + vfd.comp.name;
            }
            else if (dep instanceof ComponentFactoryDependency) {
                var cfd = dep;
                depTemplate = _this._assertComponentKnown(cfd.comp.reference, true);
                cfd.placeholder.reference = depTemplate.proxyComponentFactory;
                cfd.placeholder.name = "compFactory_" + cfd.comp.name;
            }
            else if (dep instanceof DirectiveWrapperDependency) {
                var dwd = dep;
                dwd.placeholder.reference = _this._assertDirectiveWrapper(dwd.dir.reference);
            }
        });
        var statements = (_a = stylesCompileResult.componentStylesheet.statements).concat.apply(_a, compiledAnimations.map(function (ca) { return ca.statements; }))
            .concat(compileResult.statements);
        var viewClass;
        if (!this._compilerConfig.useJit) {
            viewClass = interpretStatements(statements, compileResult.viewClassVar);
        }
        else {
            viewClass = jitStatements("/" + template.ngModule.type.name + "/" + template.compType.name + "/" + (template.isHost ? 'host' : 'component') + ".ngfactory.js", statements, compileResult.viewClassVar);
        }
        template.compiled(viewClass);
        var _a;
    };
    RuntimeCompiler.prototype._resolveStylesCompileResult = function (result, externalStylesheetsByModuleUrl) {
        var _this = this;
        result.dependencies.forEach(function (dep, i) {
            var nestedCompileResult = externalStylesheetsByModuleUrl.get(dep.moduleUrl);
            var nestedStylesArr = _this._resolveAndEvalStylesCompileResult(nestedCompileResult, externalStylesheetsByModuleUrl);
            dep.valuePlaceholder.reference = nestedStylesArr;
            dep.valuePlaceholder.name = "importedStyles" + i;
        });
    };
    RuntimeCompiler.prototype._resolveAndEvalStylesCompileResult = function (result, externalStylesheetsByModuleUrl) {
        this._resolveStylesCompileResult(result, externalStylesheetsByModuleUrl);
        if (!this._compilerConfig.useJit) {
            return interpretStatements(result.statements, result.stylesVar);
        }
        else {
            return jitStatements("/" + result.meta.moduleUrl + ".css.js", result.statements, result.stylesVar);
        }
    };
    RuntimeCompiler.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    RuntimeCompiler.ctorParameters = [
        { type: Injector, },
        { type: CompileMetadataResolver, },
        { type: TemplateParser, },
        { type: StyleCompiler, },
        { type: ViewCompiler, },
        { type: NgModuleCompiler, },
        { type: DirectiveWrapperCompiler, },
        { type: CompilerConfig, },
        { type: AnimationParser, },
    ];
    return RuntimeCompiler;
}());
var CompiledTemplate = (function () {
    function CompiledTemplate(isHost, selector, compType, compMeta, ngModule, directives) {
        this.isHost = isHost;
        this.compType = compType;
        this.compMeta = compMeta;
        this.ngModule = ngModule;
        this.directives = directives;
        this._viewClass = null;
        this.isCompiled = false;
        var self = this;
        this.proxyViewClass = function () {
            if (!self._viewClass) {
                throw new Error("Illegal state: CompiledTemplate for " + stringify(self.compType) + " is not compiled yet!");
            }
            return self._viewClass.apply(this, arguments);
        };
        this.proxyComponentFactory = isHost ?
            new ComponentFactory(selector, this.proxyViewClass, compType.reference) :
            null;
    }
    CompiledTemplate.prototype.compiled = function (viewClass) {
        this._viewClass = viewClass;
        this.proxyViewClass.prototype = viewClass.prototype;
        this.isCompiled = true;
    };
    return CompiledTemplate;
}());
function assertComponent(meta) {
    if (!meta.isComponent) {
        throw new Error("Could not compile '" + meta.type.name + "' because it is not a component.");
    }
}
/**
 * Implements `Compiler` by delegating to the RuntimeCompiler using a known module.
 */
var ModuleBoundCompiler = (function () {
    function ModuleBoundCompiler(_delegate, _ngModule) {
        this._delegate = _delegate;
        this._ngModule = _ngModule;
    }
    Object.defineProperty(ModuleBoundCompiler.prototype, "_injector", {
        get: function () { return this._delegate.injector; },
        enumerable: true,
        configurable: true
    });
    ModuleBoundCompiler.prototype.compileModuleSync = function (moduleType) {
        return this._delegate.compileModuleSync(moduleType);
    };
    ModuleBoundCompiler.prototype.compileModuleAsync = function (moduleType) {
        return this._delegate.compileModuleAsync(moduleType);
    };
    ModuleBoundCompiler.prototype.compileModuleAndAllComponentsSync = function (moduleType) {
        return this._delegate.compileModuleAndAllComponentsSync(moduleType);
    };
    ModuleBoundCompiler.prototype.compileModuleAndAllComponentsAsync = function (moduleType) {
        return this._delegate.compileModuleAndAllComponentsAsync(moduleType);
    };
    /**
     * Clears all caches
     */
    ModuleBoundCompiler.prototype.clearCache = function () { this._delegate.clearCache(); };
    /**
     * Clears the cache for the given component/ngModule.
     */
    ModuleBoundCompiler.prototype.clearCacheFor = function (type) { this._delegate.clearCacheFor(type); };
    return ModuleBoundCompiler;
}());
//# sourceMappingURL=runtime_compiler.js.map