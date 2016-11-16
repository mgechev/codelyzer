/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { AnimationAnimateMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationStateDeclarationMetadata, AnimationStateTransitionMetadata, AnimationStyleMetadata, AnimationWithStepsMetadata, Attribute, Component, Host, Inject, Injectable, Optional, Self, SkipSelf, Type, resolveForwardRef } from '@angular/core';
import { assertArrayOfStrings, assertInterpolationSymbols } from './assertions';
import * as cpl from './compile_metadata';
import { DirectiveNormalizer } from './directive_normalizer';
import { DirectiveResolver } from './directive_resolver';
import { ListWrapper } from './facade/collection';
import { isBlank, isPresent, stringify } from './facade/lang';
import { Identifiers, resolveIdentifierToken } from './identifiers';
import { hasLifecycleHook } from './lifecycle_reflector';
import { NgModuleResolver } from './ng_module_resolver';
import { PipeResolver } from './pipe_resolver';
import { ComponentStillLoadingError, LIFECYCLE_HOOKS_VALUES, ReflectorReader, reflector } from './private_import_core';
import { ElementSchemaRegistry } from './schema/element_schema_registry';
import { getUrlScheme } from './url_resolver';
import { MODULE_SUFFIX, ValueTransformer, sanitizeIdentifier, visitValue } from './util';
// Design notes:
// - don't lazily create metadata:
//   For some metadata, we need to do async work sometimes,
//   so the user has to kick off this loading.
//   But we want to report errors even when the async work is
//   not required to check that the user would have been able
//   to wait correctly.
export var CompileMetadataResolver = (function () {
    function CompileMetadataResolver(_ngModuleResolver, _directiveResolver, _pipeResolver, _schemaRegistry, _directiveNormalizer, _reflector) {
        if (_reflector === void 0) { _reflector = reflector; }
        this._ngModuleResolver = _ngModuleResolver;
        this._directiveResolver = _directiveResolver;
        this._pipeResolver = _pipeResolver;
        this._schemaRegistry = _schemaRegistry;
        this._directiveNormalizer = _directiveNormalizer;
        this._reflector = _reflector;
        this._directiveCache = new Map();
        this._directiveSummaryCache = new Map();
        this._pipeCache = new Map();
        this._pipeSummaryCache = new Map();
        this._ngModuleCache = new Map();
        this._ngModuleOfTypes = new Map();
        this._anonymousTypes = new Map();
        this._anonymousTypeIndex = 0;
    }
    CompileMetadataResolver.prototype.sanitizeTokenName = function (token) {
        var identifier = stringify(token);
        if (identifier.indexOf('(') >= 0) {
            // case: anonymous functions!
            var found = this._anonymousTypes.get(token);
            if (!found) {
                this._anonymousTypes.set(token, this._anonymousTypeIndex++);
                found = this._anonymousTypes.get(token);
            }
            identifier = "anonymous_token_" + found + "_";
        }
        return sanitizeIdentifier(identifier);
    };
    CompileMetadataResolver.prototype.clearCacheFor = function (type) {
        var dirMeta = this._directiveCache.get(type);
        this._directiveCache.delete(type);
        this._directiveSummaryCache.delete(type);
        this._pipeCache.delete(type);
        this._pipeSummaryCache.delete(type);
        this._ngModuleOfTypes.delete(type);
        // Clear all of the NgModule as they contain transitive information!
        this._ngModuleCache.clear();
        if (dirMeta) {
            this._directiveNormalizer.clearCacheFor(dirMeta);
        }
    };
    CompileMetadataResolver.prototype.clearCache = function () {
        this._directiveCache.clear();
        this._directiveSummaryCache.clear();
        this._pipeCache.clear();
        this._pipeSummaryCache.clear();
        this._ngModuleCache.clear();
        this._ngModuleOfTypes.clear();
        this._directiveNormalizer.clearCache();
    };
    CompileMetadataResolver.prototype.getAnimationEntryMetadata = function (entry) {
        var _this = this;
        var defs = entry.definitions.map(function (def) { return _this._getAnimationStateMetadata(def); });
        return new cpl.CompileAnimationEntryMetadata(entry.name, defs);
    };
    CompileMetadataResolver.prototype._getAnimationStateMetadata = function (value) {
        if (value instanceof AnimationStateDeclarationMetadata) {
            var styles = this._getAnimationStyleMetadata(value.styles);
            return new cpl.CompileAnimationStateDeclarationMetadata(value.stateNameExpr, styles);
        }
        if (value instanceof AnimationStateTransitionMetadata) {
            return new cpl.CompileAnimationStateTransitionMetadata(value.stateChangeExpr, this._getAnimationMetadata(value.steps));
        }
        return null;
    };
    CompileMetadataResolver.prototype._getAnimationStyleMetadata = function (value) {
        return new cpl.CompileAnimationStyleMetadata(value.offset, value.styles);
    };
    CompileMetadataResolver.prototype._getAnimationMetadata = function (value) {
        var _this = this;
        if (value instanceof AnimationStyleMetadata) {
            return this._getAnimationStyleMetadata(value);
        }
        if (value instanceof AnimationKeyframesSequenceMetadata) {
            return new cpl.CompileAnimationKeyframesSequenceMetadata(value.steps.map(function (entry) { return _this._getAnimationStyleMetadata(entry); }));
        }
        if (value instanceof AnimationAnimateMetadata) {
            var animateData = this
                ._getAnimationMetadata(value.styles);
            return new cpl.CompileAnimationAnimateMetadata(value.timings, animateData);
        }
        if (value instanceof AnimationWithStepsMetadata) {
            var steps = value.steps.map(function (step) { return _this._getAnimationMetadata(step); });
            if (value instanceof AnimationGroupMetadata) {
                return new cpl.CompileAnimationGroupMetadata(steps);
            }
            return new cpl.CompileAnimationSequenceMetadata(steps);
        }
        return null;
    };
    CompileMetadataResolver.prototype._loadDirectiveMetadata = function (directiveType, isSync) {
        var _this = this;
        if (this._directiveCache.has(directiveType)) {
            return;
        }
        directiveType = resolveForwardRef(directiveType);
        var dirMeta = this._directiveResolver.resolve(directiveType);
        if (!dirMeta) {
            return null;
        }
        var moduleUrl = staticTypeModuleUrl(directiveType);
        var createDirectiveMetadata = function (templateMeta) {
            var changeDetectionStrategy = null;
            var viewProviders = [];
            var entryComponentMetadata = [];
            var selector = dirMeta.selector;
            if (dirMeta instanceof Component) {
                // Component
                changeDetectionStrategy = dirMeta.changeDetection;
                if (dirMeta.viewProviders) {
                    viewProviders = _this._getProvidersMetadata(dirMeta.viewProviders, entryComponentMetadata, "viewProviders for \"" + stringify(directiveType) + "\"");
                }
                if (dirMeta.entryComponents) {
                    entryComponentMetadata =
                        flattenAndDedupeArray(dirMeta.entryComponents)
                            .map(function (type) { return _this._getIdentifierMetadata(type, staticTypeModuleUrl(type)); })
                            .concat(entryComponentMetadata);
                }
                if (!selector) {
                    selector = _this._schemaRegistry.getDefaultComponentElementName();
                }
            }
            else {
                // Directive
                if (!selector) {
                    throw new Error("Directive " + stringify(directiveType) + " has no selector, please add it!");
                }
            }
            var providers = [];
            if (isPresent(dirMeta.providers)) {
                providers = _this._getProvidersMetadata(dirMeta.providers, entryComponentMetadata, "providers for \"" + stringify(directiveType) + "\"");
            }
            var queries = [];
            var viewQueries = [];
            if (isPresent(dirMeta.queries)) {
                queries = _this._getQueriesMetadata(dirMeta.queries, false, directiveType);
                viewQueries = _this._getQueriesMetadata(dirMeta.queries, true, directiveType);
            }
            var meta = cpl.CompileDirectiveMetadata.create({
                selector: selector,
                exportAs: dirMeta.exportAs,
                isComponent: !!templateMeta,
                type: _this._getTypeMetadata(directiveType, moduleUrl),
                template: templateMeta,
                changeDetection: changeDetectionStrategy,
                inputs: dirMeta.inputs,
                outputs: dirMeta.outputs,
                host: dirMeta.host,
                providers: providers,
                viewProviders: viewProviders,
                queries: queries,
                viewQueries: viewQueries,
                entryComponents: entryComponentMetadata
            });
            _this._directiveCache.set(directiveType, meta);
            _this._directiveSummaryCache.set(directiveType, meta.toSummary());
            return meta;
        };
        if (dirMeta instanceof Component) {
            // component
            moduleUrl = componentModuleUrl(this._reflector, directiveType, dirMeta);
            assertArrayOfStrings('styles', dirMeta.styles);
            assertArrayOfStrings('styleUrls', dirMeta.styleUrls);
            assertInterpolationSymbols('interpolation', dirMeta.interpolation);
            var animations = dirMeta.animations ?
                dirMeta.animations.map(function (e) { return _this.getAnimationEntryMetadata(e); }) :
                null;
            var templateMeta = this._directiveNormalizer.normalizeTemplate({
                componentType: directiveType,
                moduleUrl: moduleUrl,
                encapsulation: dirMeta.encapsulation,
                template: dirMeta.template,
                templateUrl: dirMeta.templateUrl,
                styles: dirMeta.styles,
                styleUrls: dirMeta.styleUrls,
                animations: animations,
                interpolation: dirMeta.interpolation
            });
            if (templateMeta.syncResult) {
                createDirectiveMetadata(templateMeta.syncResult);
                return null;
            }
            else {
                if (isSync) {
                    throw new ComponentStillLoadingError(directiveType);
                }
                return templateMeta.asyncResult.then(createDirectiveMetadata);
            }
        }
        else {
            // directive
            createDirectiveMetadata(null);
            return null;
        }
    };
    /**
     * Gets the metadata for the given directive.
     * This assumes `loadNgModuleMetadata` has been called first.
     */
    CompileMetadataResolver.prototype.getDirectiveMetadata = function (directiveType) {
        var dirMeta = this._directiveCache.get(directiveType);
        if (!dirMeta) {
            throw new Error("Illegal state: getDirectiveMetadata can only be called after loadNgModuleMetadata for a module that declares it. Directive " + stringify(directiveType) + ".");
        }
        return dirMeta;
    };
    CompileMetadataResolver.prototype.getDirectiveSummary = function (dirType) {
        var dirSummary = this._directiveSummaryCache.get(dirType);
        if (!dirSummary) {
            throw new Error("Illegal state: getDirectiveSummary can only be called after loadNgModuleMetadata for a module that imports it. Directive " + stringify(dirType) + ".");
        }
        return dirSummary;
    };
    CompileMetadataResolver.prototype.isDirective = function (type) { return this._directiveResolver.isDirective(type); };
    CompileMetadataResolver.prototype.isPipe = function (type) { return this._pipeResolver.isPipe(type); };
    /**
     * Gets the metadata for the given module.
     * This assumes `loadNgModuleMetadata` has been called first.
     */
    CompileMetadataResolver.prototype.getNgModuleMetadata = function (moduleType) {
        var modMeta = this._ngModuleCache.get(moduleType);
        if (!modMeta) {
            throw new Error("Illegal state: getNgModuleMetadata can only be called after loadNgModuleMetadata. Module " + stringify(moduleType) + ".");
        }
        return modMeta;
    };
    CompileMetadataResolver.prototype._loadNgModuleSummary = function (moduleType, isSync) {
        // TODO(tbosch): add logic to read summary files!
        // - needs to add directive / pipe summaries to this._directiveSummaryCache /
        // this._pipeSummaryCache as well!
        var moduleMeta = this._loadNgModuleMetadata(moduleType, isSync, false);
        return moduleMeta ? moduleMeta.toSummary() : null;
    };
    /**
     * Loads an NgModule and all of its directives. This includes loading the exported directives of
     * imported modules,
     * but not private directives of imported modules.
     */
    CompileMetadataResolver.prototype.loadNgModuleMetadata = function (moduleType, isSync, throwIfNotFound) {
        if (throwIfNotFound === void 0) { throwIfNotFound = true; }
        var ngModule = this._loadNgModuleMetadata(moduleType, isSync, throwIfNotFound);
        var loading = ngModule ? Promise.all(ngModule.transitiveModule.loadingPromises) : Promise.resolve(null);
        return { ngModule: ngModule, loading: loading };
    };
    CompileMetadataResolver.prototype._loadNgModuleMetadata = function (moduleType, isSync, throwIfNotFound) {
        var _this = this;
        if (throwIfNotFound === void 0) { throwIfNotFound = true; }
        moduleType = resolveForwardRef(moduleType);
        var compileMeta = this._ngModuleCache.get(moduleType);
        if (compileMeta) {
            return compileMeta;
        }
        var meta = this._ngModuleResolver.resolve(moduleType, throwIfNotFound);
        if (!meta) {
            return null;
        }
        var declaredDirectives = [];
        var exportedNonModuleIdentifiers = [];
        var declaredPipes = [];
        var importedModules = [];
        var exportedModules = [];
        var providers = [];
        var entryComponents = [];
        var bootstrapComponents = [];
        var schemas = [];
        if (meta.imports) {
            flattenAndDedupeArray(meta.imports).forEach(function (importedType) {
                var importedModuleType;
                if (isValidType(importedType)) {
                    importedModuleType = importedType;
                }
                else if (importedType && importedType.ngModule) {
                    var moduleWithProviders = importedType;
                    importedModuleType = moduleWithProviders.ngModule;
                    if (moduleWithProviders.providers) {
                        providers.push.apply(providers, _this._getProvidersMetadata(moduleWithProviders.providers, entryComponents, "provider for the NgModule '" + stringify(importedModuleType) + "'"));
                    }
                }
                if (importedModuleType) {
                    var importedModuleSummary = _this._loadNgModuleSummary(importedModuleType, isSync);
                    if (!importedModuleSummary) {
                        throw new Error("Unexpected " + _this._getTypeDescriptor(importedType) + " '" + stringify(importedType) + "' imported by the module '" + stringify(moduleType) + "'");
                    }
                    importedModules.push(importedModuleSummary);
                }
                else {
                    throw new Error("Unexpected value '" + stringify(importedType) + "' imported by the module '" + stringify(moduleType) + "'");
                }
            });
        }
        if (meta.exports) {
            flattenAndDedupeArray(meta.exports).forEach(function (exportedType) {
                if (!isValidType(exportedType)) {
                    throw new Error("Unexpected value '" + stringify(exportedType) + "' exported by the module '" + stringify(moduleType) + "'");
                }
                var exportedModuleSummary = _this._loadNgModuleSummary(exportedType, isSync);
                if (exportedModuleSummary) {
                    exportedModules.push(exportedModuleSummary);
                }
                else {
                    exportedNonModuleIdentifiers.push(_this._getIdentifierMetadata(exportedType, staticTypeModuleUrl(exportedType)));
                }
            });
        }
        // Note: This will be modified later, so we rely on
        // getting a new instance every time!
        var transitiveModule = this._getTransitiveNgModuleMetadata(importedModules, exportedModules);
        if (meta.declarations) {
            flattenAndDedupeArray(meta.declarations).forEach(function (declaredType) {
                if (!isValidType(declaredType)) {
                    throw new Error("Unexpected value '" + stringify(declaredType) + "' declared by the module '" + stringify(moduleType) + "'");
                }
                var declaredIdentifier = _this._getIdentifierMetadata(declaredType, staticTypeModuleUrl(declaredType));
                if (_this._directiveResolver.isDirective(declaredType)) {
                    transitiveModule.directivesSet.add(declaredType);
                    transitiveModule.directives.push(declaredIdentifier);
                    declaredDirectives.push(declaredIdentifier);
                    _this._addTypeToModule(declaredType, moduleType);
                    var loadingPromise = _this._loadDirectiveMetadata(declaredType, isSync);
                    if (loadingPromise) {
                        transitiveModule.loadingPromises.push(loadingPromise);
                    }
                }
                else if (_this._pipeResolver.isPipe(declaredType)) {
                    transitiveModule.pipesSet.add(declaredType);
                    transitiveModule.pipes.push(declaredIdentifier);
                    declaredPipes.push(declaredIdentifier);
                    _this._addTypeToModule(declaredType, moduleType);
                    _this._loadPipeMetadata(declaredType);
                }
                else {
                    throw new Error("Unexpected " + _this._getTypeDescriptor(declaredType) + " '" + stringify(declaredType) + "' declared by the module '" + stringify(moduleType) + "'");
                }
            });
        }
        var exportedDirectives = [];
        var exportedPipes = [];
        exportedNonModuleIdentifiers.forEach(function (exportedId) {
            if (transitiveModule.directivesSet.has(exportedId.reference)) {
                exportedDirectives.push(exportedId);
            }
            else if (transitiveModule.pipesSet.has(exportedId.reference)) {
                exportedPipes.push(exportedId);
            }
            else {
                throw new Error("Can't export " + _this._getTypeDescriptor(exportedId.reference) + " " + stringify(exportedId.reference) + " from " + stringify(moduleType) + " as it was neither declared nor imported!");
            }
        });
        // The providers of the module have to go last
        // so that they overwrite any other provider we already added.
        if (meta.providers) {
            providers.push.apply(providers, this._getProvidersMetadata(meta.providers, entryComponents, "provider for the NgModule '" + stringify(moduleType) + "'"));
        }
        if (meta.entryComponents) {
            entryComponents.push.apply(entryComponents, flattenAndDedupeArray(meta.entryComponents)
                .map(function (type) { return _this._getTypeMetadata(type, staticTypeModuleUrl(type)); }));
        }
        if (meta.bootstrap) {
            var typeMetadata = flattenAndDedupeArray(meta.bootstrap).map(function (type) {
                if (!isValidType(type)) {
                    throw new Error("Unexpected value '" + stringify(type) + "' used in the bootstrap property of module '" + stringify(moduleType) + "'");
                }
                return _this._getTypeMetadata(type, staticTypeModuleUrl(type));
            });
            bootstrapComponents.push.apply(bootstrapComponents, typeMetadata);
        }
        entryComponents.push.apply(entryComponents, bootstrapComponents);
        if (meta.schemas) {
            schemas.push.apply(schemas, flattenAndDedupeArray(meta.schemas));
        }
        (_a = transitiveModule.entryComponents).push.apply(_a, entryComponents);
        (_b = transitiveModule.providers).push.apply(_b, providers);
        compileMeta = new cpl.CompileNgModuleMetadata({
            type: this._getTypeMetadata(moduleType, staticTypeModuleUrl(moduleType)),
            providers: providers,
            entryComponents: entryComponents,
            bootstrapComponents: bootstrapComponents,
            schemas: schemas,
            declaredDirectives: declaredDirectives,
            exportedDirectives: exportedDirectives,
            declaredPipes: declaredPipes,
            exportedPipes: exportedPipes,
            importedModules: importedModules,
            exportedModules: exportedModules,
            transitiveModule: transitiveModule,
            id: meta.id,
        });
        transitiveModule.modules.push(compileMeta.toInjectorSummary());
        this._ngModuleCache.set(moduleType, compileMeta);
        return compileMeta;
        var _a, _b;
    };
    CompileMetadataResolver.prototype._getTypeDescriptor = function (type) {
        if (this._directiveResolver.isDirective(type)) {
            return 'directive';
        }
        if (this._pipeResolver.isPipe(type)) {
            return 'pipe';
        }
        if (this._ngModuleResolver.isNgModule(type)) {
            return 'module';
        }
        if (type.provide) {
            return 'provider';
        }
        return 'value';
    };
    CompileMetadataResolver.prototype._addTypeToModule = function (type, moduleType) {
        var oldModule = this._ngModuleOfTypes.get(type);
        if (oldModule && oldModule !== moduleType) {
            throw new Error(("Type " + stringify(type) + " is part of the declarations of 2 modules: " + stringify(oldModule) + " and " + stringify(moduleType) + "! ") +
                ("Please consider moving " + stringify(type) + " to a higher module that imports " + stringify(oldModule) + " and " + stringify(moduleType) + ". ") +
                ("You can also create a new NgModule that exports and includes " + stringify(type) + " then import that NgModule in " + stringify(oldModule) + " and " + stringify(moduleType) + "."));
        }
        this._ngModuleOfTypes.set(type, moduleType);
    };
    CompileMetadataResolver.prototype._getTransitiveNgModuleMetadata = function (importedModules, exportedModules) {
        // collect `providers` / `entryComponents` from all imported and all exported modules
        var transitiveModules = getTransitiveImportedModules(importedModules.concat(exportedModules));
        var providers = flattenArray(transitiveModules.map(function (ngModule) { return ngModule.providers; }));
        var entryComponents = flattenArray(transitiveModules.map(function (ngModule) { return ngModule.entryComponents; }));
        var transitiveExportedModules = getTransitiveExportedModules(importedModules);
        var directives = flattenArray(transitiveExportedModules.map(function (ngModule) { return ngModule.exportedDirectives; }));
        var pipes = flattenArray(transitiveExportedModules.map(function (ngModule) { return ngModule.exportedPipes; }));
        var loadingPromises = ListWrapper.flatten(transitiveExportedModules.map(function (ngModule) { return ngModule.loadingPromises; }));
        return new cpl.TransitiveCompileNgModuleMetadata(transitiveModules, providers, entryComponents, directives, pipes, loadingPromises);
    };
    CompileMetadataResolver.prototype._getIdentifierMetadata = function (type, moduleUrl) {
        type = resolveForwardRef(type);
        return new cpl.CompileIdentifierMetadata({ name: this.sanitizeTokenName(type), moduleUrl: moduleUrl, reference: type });
    };
    CompileMetadataResolver.prototype._getTypeMetadata = function (type, moduleUrl, dependencies) {
        if (dependencies === void 0) { dependencies = null; }
        var identifier = this._getIdentifierMetadata(type, moduleUrl);
        return new cpl.CompileTypeMetadata({
            name: identifier.name,
            moduleUrl: identifier.moduleUrl,
            reference: identifier.reference,
            diDeps: this._getDependenciesMetadata(identifier.reference, dependencies),
            lifecycleHooks: LIFECYCLE_HOOKS_VALUES.filter(function (hook) { return hasLifecycleHook(hook, identifier.reference); }),
        });
    };
    CompileMetadataResolver.prototype._getFactoryMetadata = function (factory, moduleUrl, dependencies) {
        if (dependencies === void 0) { dependencies = null; }
        factory = resolveForwardRef(factory);
        return new cpl.CompileFactoryMetadata({
            name: this.sanitizeTokenName(factory),
            moduleUrl: moduleUrl,
            reference: factory,
            diDeps: this._getDependenciesMetadata(factory, dependencies)
        });
    };
    /**
     * Gets the metadata for the given pipe.
     * This assumes `loadNgModuleMetadata` has been called first.
     */
    CompileMetadataResolver.prototype.getPipeMetadata = function (pipeType) {
        var pipeMeta = this._pipeCache.get(pipeType);
        if (!pipeMeta) {
            throw new Error("Illegal state: getPipeMetadata can only be called after loadNgModuleMetadata for a module that declares it. Pipe " + stringify(pipeType) + ".");
        }
        return pipeMeta;
    };
    CompileMetadataResolver.prototype.getPipeSummary = function (pipeType) {
        var pipeSummary = this._pipeSummaryCache.get(pipeType);
        if (!pipeSummary) {
            throw new Error("Illegal state: getPipeSummary can only be called after loadNgModuleMetadata for a module that imports it. Pipe " + stringify(pipeType) + ".");
        }
        return pipeSummary;
    };
    CompileMetadataResolver.prototype._loadPipeMetadata = function (pipeType) {
        pipeType = resolveForwardRef(pipeType);
        var pipeMeta = this._pipeResolver.resolve(pipeType);
        if (!pipeMeta) {
            return null;
        }
        var meta = new cpl.CompilePipeMetadata({
            type: this._getTypeMetadata(pipeType, staticTypeModuleUrl(pipeType)),
            name: pipeMeta.name,
            pure: pipeMeta.pure
        });
        this._pipeCache.set(pipeType, meta);
        this._pipeSummaryCache.set(pipeType, meta.toSummary());
    };
    CompileMetadataResolver.prototype._getDependenciesMetadata = function (typeOrFunc, dependencies) {
        var _this = this;
        var hasUnknownDeps = false;
        var params = dependencies || this._reflector.parameters(typeOrFunc) || [];
        var dependenciesMetadata = params.map(function (param) {
            var isAttribute = false;
            var isHost = false;
            var isSelf = false;
            var isSkipSelf = false;
            var isOptional = false;
            var token = null;
            if (Array.isArray(param)) {
                param.forEach(function (paramEntry) {
                    if (paramEntry instanceof Host) {
                        isHost = true;
                    }
                    else if (paramEntry instanceof Self) {
                        isSelf = true;
                    }
                    else if (paramEntry instanceof SkipSelf) {
                        isSkipSelf = true;
                    }
                    else if (paramEntry instanceof Optional) {
                        isOptional = true;
                    }
                    else if (paramEntry instanceof Attribute) {
                        isAttribute = true;
                        token = paramEntry.attributeName;
                    }
                    else if (paramEntry instanceof Inject) {
                        token = paramEntry.token;
                    }
                    else if (isValidType(paramEntry) && isBlank(token)) {
                        token = paramEntry;
                    }
                });
            }
            else {
                token = param;
            }
            if (isBlank(token)) {
                hasUnknownDeps = true;
                return null;
            }
            return new cpl.CompileDiDependencyMetadata({
                isAttribute: isAttribute,
                isHost: isHost,
                isSelf: isSelf,
                isSkipSelf: isSkipSelf,
                isOptional: isOptional,
                token: _this._getTokenMetadata(token)
            });
        });
        if (hasUnknownDeps) {
            var depsTokens = dependenciesMetadata.map(function (dep) { return dep ? stringify(dep.token) : '?'; }).join(', ');
            throw new Error("Can't resolve all parameters for " + stringify(typeOrFunc) + ": (" + depsTokens + ").");
        }
        return dependenciesMetadata;
    };
    CompileMetadataResolver.prototype._getTokenMetadata = function (token) {
        token = resolveForwardRef(token);
        var compileToken;
        if (typeof token === 'string') {
            compileToken = new cpl.CompileTokenMetadata({ value: token });
        }
        else {
            compileToken = new cpl.CompileTokenMetadata({
                identifier: new cpl.CompileIdentifierMetadata({
                    reference: token,
                    name: this.sanitizeTokenName(token),
                    moduleUrl: staticTypeModuleUrl(token)
                })
            });
        }
        return compileToken;
    };
    CompileMetadataResolver.prototype._getProvidersMetadata = function (providers, targetEntryComponents, debugInfo) {
        var _this = this;
        var compileProviders = [];
        providers.forEach(function (provider, providerIdx) {
            provider = resolveForwardRef(provider);
            if (provider && typeof provider == 'object' && provider.hasOwnProperty('provide')) {
                provider = new cpl.ProviderMeta(provider.provide, provider);
            }
            var compileProvider;
            if (Array.isArray(provider)) {
                compileProvider = _this._getProvidersMetadata(provider, targetEntryComponents, debugInfo);
            }
            else if (provider instanceof cpl.ProviderMeta) {
                var tokenMeta = _this._getTokenMetadata(provider.token);
                if (tokenMeta.reference ===
                    resolveIdentifierToken(Identifiers.ANALYZE_FOR_ENTRY_COMPONENTS).reference) {
                    targetEntryComponents.push.apply(targetEntryComponents, _this._getEntryComponentsFromProvider(provider));
                }
                else {
                    compileProvider = _this.getProviderMetadata(provider);
                }
            }
            else if (isValidType(provider)) {
                compileProvider = _this._getTypeMetadata(provider, staticTypeModuleUrl(provider));
            }
            else {
                var providersInfo = providers.reduce(function (soFar, seenProvider, seenProviderIdx) {
                    if (seenProviderIdx < providerIdx) {
                        soFar.push("" + stringify(seenProvider));
                    }
                    else if (seenProviderIdx == providerIdx) {
                        soFar.push("?" + stringify(seenProvider) + "?");
                    }
                    else if (seenProviderIdx == providerIdx + 1) {
                        soFar.push('...');
                    }
                    return soFar;
                }, [])
                    .join(', ');
                throw new Error("Invalid " + (debugInfo ? debugInfo : 'provider') + " - only instances of Provider and Type are allowed, got: [" + providersInfo + "]");
            }
            if (compileProvider) {
                compileProviders.push(compileProvider);
            }
        });
        return compileProviders;
    };
    CompileMetadataResolver.prototype._getEntryComponentsFromProvider = function (provider) {
        var _this = this;
        var components = [];
        var collectedIdentifiers = [];
        if (provider.useFactory || provider.useExisting || provider.useClass) {
            throw new Error("The ANALYZE_FOR_ENTRY_COMPONENTS token only supports useValue!");
        }
        if (!provider.multi) {
            throw new Error("The ANALYZE_FOR_ENTRY_COMPONENTS token only supports 'multi = true'!");
        }
        convertToCompileValue(provider.useValue, collectedIdentifiers);
        collectedIdentifiers.forEach(function (identifier) {
            if (_this._directiveResolver.isDirective(identifier.reference)) {
                components.push(identifier);
            }
        });
        return components;
    };
    CompileMetadataResolver.prototype.getProviderMetadata = function (provider) {
        var compileDeps;
        var compileTypeMetadata = null;
        var compileFactoryMetadata = null;
        if (provider.useClass) {
            compileTypeMetadata = this._getTypeMetadata(provider.useClass, staticTypeModuleUrl(provider.useClass), provider.dependencies);
            compileDeps = compileTypeMetadata.diDeps;
        }
        else if (provider.useFactory) {
            compileFactoryMetadata = this._getFactoryMetadata(provider.useFactory, staticTypeModuleUrl(provider.useFactory), provider.dependencies);
            compileDeps = compileFactoryMetadata.diDeps;
        }
        return new cpl.CompileProviderMetadata({
            token: this._getTokenMetadata(provider.token),
            useClass: compileTypeMetadata,
            useValue: convertToCompileValue(provider.useValue, []),
            useFactory: compileFactoryMetadata,
            useExisting: provider.useExisting ? this._getTokenMetadata(provider.useExisting) : null,
            deps: compileDeps,
            multi: provider.multi
        });
    };
    CompileMetadataResolver.prototype._getQueriesMetadata = function (queries, isViewQuery, directiveType) {
        var _this = this;
        var res = [];
        Object.keys(queries).forEach(function (propertyName) {
            var query = queries[propertyName];
            if (query.isViewQuery === isViewQuery) {
                res.push(_this._getQueryMetadata(query, propertyName, directiveType));
            }
        });
        return res;
    };
    CompileMetadataResolver.prototype._queryVarBindings = function (selector) { return selector.split(/\s*,\s*/); };
    CompileMetadataResolver.prototype._getQueryMetadata = function (q, propertyName, typeOrFunc) {
        var _this = this;
        var selectors;
        if (typeof q.selector === 'string') {
            selectors =
                this._queryVarBindings(q.selector).map(function (varName) { return _this._getTokenMetadata(varName); });
        }
        else {
            if (!q.selector) {
                throw new Error("Can't construct a query for the property \"" + propertyName + "\" of \"" + stringify(typeOrFunc) + "\" since the query selector wasn't defined.");
            }
            selectors = [this._getTokenMetadata(q.selector)];
        }
        return new cpl.CompileQueryMetadata({
            selectors: selectors,
            first: q.first,
            descendants: q.descendants, propertyName: propertyName,
            read: q.read ? this._getTokenMetadata(q.read) : null
        });
    };
    CompileMetadataResolver.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    CompileMetadataResolver.ctorParameters = [
        { type: NgModuleResolver, },
        { type: DirectiveResolver, },
        { type: PipeResolver, },
        { type: ElementSchemaRegistry, },
        { type: DirectiveNormalizer, },
        { type: ReflectorReader, },
    ];
    return CompileMetadataResolver;
}());
function getTransitiveExportedModules(modules, targetModules, visitedModules) {
    if (targetModules === void 0) { targetModules = []; }
    if (visitedModules === void 0) { visitedModules = new Set(); }
    modules.forEach(function (ngModule) {
        if (!visitedModules.has(ngModule.type.reference)) {
            visitedModules.add(ngModule.type.reference);
            getTransitiveExportedModules(ngModule.exportedModules, targetModules, visitedModules);
            // Add after recursing so imported/exported modules are before the module itself.
            // This is important for overwriting providers of imported modules!
            targetModules.push(ngModule);
        }
    });
    return targetModules;
}
function getTransitiveImportedModules(modules, targetModules, visitedModules) {
    if (targetModules === void 0) { targetModules = []; }
    if (visitedModules === void 0) { visitedModules = new Set(); }
    modules.forEach(function (ngModule) {
        if (!visitedModules.has(ngModule.type.reference)) {
            visitedModules.add(ngModule.type.reference);
            var nestedModules = ngModule.importedModules.concat(ngModule.exportedModules);
            getTransitiveImportedModules(nestedModules, targetModules, visitedModules);
            // Add after recursing so imported/exported modules are before the module itself.
            // This is important for overwriting providers of imported modules!
            targetModules.push(ngModule);
        }
    });
    return targetModules;
}
function flattenArray(tree, out) {
    if (out === void 0) { out = []; }
    if (tree) {
        for (var i = 0; i < tree.length; i++) {
            var item = resolveForwardRef(tree[i]);
            if (Array.isArray(item)) {
                flattenArray(item, out);
            }
            else {
                out.push(item);
            }
        }
    }
    return out;
}
function dedupeArray(array) {
    if (array) {
        return Array.from(new Set(array));
    }
    return [];
}
function flattenAndDedupeArray(tree) {
    return dedupeArray(flattenArray(tree));
}
function isValidType(value) {
    return cpl.isStaticSymbol(value) || (value instanceof Type);
}
function staticTypeModuleUrl(value) {
    return cpl.isStaticSymbol(value) ? value.filePath : null;
}
function componentModuleUrl(reflector, type, cmpMetadata) {
    if (cpl.isStaticSymbol(type)) {
        return staticTypeModuleUrl(type);
    }
    var moduleId = cmpMetadata.moduleId;
    if (typeof moduleId === 'string') {
        var scheme = getUrlScheme(moduleId);
        return scheme ? moduleId : "package:" + moduleId + MODULE_SUFFIX;
    }
    else if (moduleId !== null && moduleId !== void 0) {
        throw new Error(("moduleId should be a string in \"" + stringify(type) + "\". See https://goo.gl/wIDDiL for more information.\n") +
            "If you're using Webpack you should inline the template and the styles, see https://goo.gl/X2J8zc.");
    }
    return reflector.importUri(type);
}
function convertToCompileValue(value, targetIdentifiers) {
    return visitValue(value, new _CompileValueConverter(), targetIdentifiers);
}
var _CompileValueConverter = (function (_super) {
    __extends(_CompileValueConverter, _super);
    function _CompileValueConverter() {
        _super.apply(this, arguments);
    }
    _CompileValueConverter.prototype.visitOther = function (value, targetIdentifiers) {
        var identifier;
        if (cpl.isStaticSymbol(value)) {
            identifier = new cpl.CompileIdentifierMetadata({ name: value.name, moduleUrl: value.filePath, reference: value });
        }
        else {
            identifier = new cpl.CompileIdentifierMetadata({ reference: value });
        }
        targetIdentifiers.push(identifier);
        return identifier;
    };
    return _CompileValueConverter;
}(ValueTransformer));
//# sourceMappingURL=metadata_resolver.js.map