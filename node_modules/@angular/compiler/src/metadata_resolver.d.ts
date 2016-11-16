/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationEntryMetadata, Type } from '@angular/core';
import * as cpl from './compile_metadata';
import { DirectiveNormalizer } from './directive_normalizer';
import { DirectiveResolver } from './directive_resolver';
import { NgModuleResolver } from './ng_module_resolver';
import { PipeResolver } from './pipe_resolver';
import { ReflectorReader } from './private_import_core';
import { ElementSchemaRegistry } from './schema/element_schema_registry';
export declare class CompileMetadataResolver {
    private _ngModuleResolver;
    private _directiveResolver;
    private _pipeResolver;
    private _schemaRegistry;
    private _directiveNormalizer;
    private _reflector;
    private _directiveCache;
    private _directiveSummaryCache;
    private _pipeCache;
    private _pipeSummaryCache;
    private _ngModuleCache;
    private _ngModuleOfTypes;
    private _anonymousTypes;
    private _anonymousTypeIndex;
    constructor(_ngModuleResolver: NgModuleResolver, _directiveResolver: DirectiveResolver, _pipeResolver: PipeResolver, _schemaRegistry: ElementSchemaRegistry, _directiveNormalizer: DirectiveNormalizer, _reflector?: ReflectorReader);
    private sanitizeTokenName(token);
    clearCacheFor(type: Type<any>): void;
    clearCache(): void;
    getAnimationEntryMetadata(entry: AnimationEntryMetadata): cpl.CompileAnimationEntryMetadata;
    private _getAnimationStateMetadata(value);
    private _getAnimationStyleMetadata(value);
    private _getAnimationMetadata(value);
    private _loadDirectiveMetadata(directiveType, isSync);
    /**
     * Gets the metadata for the given directive.
     * This assumes `loadNgModuleMetadata` has been called first.
     */
    getDirectiveMetadata(directiveType: any): cpl.CompileDirectiveMetadata;
    getDirectiveSummary(dirType: any): cpl.CompileDirectiveSummary;
    isDirective(type: any): boolean;
    isPipe(type: any): boolean;
    /**
     * Gets the metadata for the given module.
     * This assumes `loadNgModuleMetadata` has been called first.
     */
    getNgModuleMetadata(moduleType: any): cpl.CompileNgModuleMetadata;
    private _loadNgModuleSummary(moduleType, isSync);
    /**
     * Loads an NgModule and all of its directives. This includes loading the exported directives of
     * imported modules,
     * but not private directives of imported modules.
     */
    loadNgModuleMetadata(moduleType: any, isSync: boolean, throwIfNotFound?: boolean): {
        ngModule: cpl.CompileNgModuleMetadata;
        loading: Promise<any>;
    };
    private _loadNgModuleMetadata(moduleType, isSync, throwIfNotFound?);
    private _getTypeDescriptor(type);
    private _addTypeToModule(type, moduleType);
    private _getTransitiveNgModuleMetadata(importedModules, exportedModules);
    private _getIdentifierMetadata(type, moduleUrl);
    private _getTypeMetadata(type, moduleUrl, dependencies?);
    private _getFactoryMetadata(factory, moduleUrl, dependencies?);
    /**
     * Gets the metadata for the given pipe.
     * This assumes `loadNgModuleMetadata` has been called first.
     */
    getPipeMetadata(pipeType: any): cpl.CompilePipeMetadata;
    getPipeSummary(pipeType: any): cpl.CompilePipeSummary;
    private _loadPipeMetadata(pipeType);
    private _getDependenciesMetadata(typeOrFunc, dependencies);
    private _getTokenMetadata(token);
    private _getProvidersMetadata(providers, targetEntryComponents, debugInfo?);
    private _getEntryComponentsFromProvider(provider);
    getProviderMetadata(provider: cpl.ProviderMeta): cpl.CompileProviderMetadata;
    private _getQueriesMetadata(queries, isViewQuery, directiveType);
    private _queryVarBindings(selector);
    private _getQueryMetadata(q, propertyName, typeOrFunc);
}
