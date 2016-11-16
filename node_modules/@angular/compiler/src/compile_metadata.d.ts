/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, SchemaMetadata, Type, ViewEncapsulation } from '@angular/core';
import { LifecycleHooks } from './private_import_core';
export declare abstract class CompileMetadataWithIdentifier {
    identifier: CompileIdentifierMetadata;
}
export declare class CompileAnimationEntryMetadata {
    name: string;
    definitions: CompileAnimationStateMetadata[];
    constructor(name?: string, definitions?: CompileAnimationStateMetadata[]);
}
export declare abstract class CompileAnimationStateMetadata {
}
export declare class CompileAnimationStateDeclarationMetadata extends CompileAnimationStateMetadata {
    stateNameExpr: string;
    styles: CompileAnimationStyleMetadata;
    constructor(stateNameExpr: string, styles: CompileAnimationStyleMetadata);
}
export declare class CompileAnimationStateTransitionMetadata extends CompileAnimationStateMetadata {
    stateChangeExpr: string;
    steps: CompileAnimationMetadata;
    constructor(stateChangeExpr: string, steps: CompileAnimationMetadata);
}
export declare abstract class CompileAnimationMetadata {
}
export declare class CompileAnimationKeyframesSequenceMetadata extends CompileAnimationMetadata {
    steps: CompileAnimationStyleMetadata[];
    constructor(steps?: CompileAnimationStyleMetadata[]);
}
export declare class CompileAnimationStyleMetadata extends CompileAnimationMetadata {
    offset: number;
    styles: Array<string | {
        [key: string]: string | number;
    }>;
    constructor(offset: number, styles?: Array<string | {
        [key: string]: string | number;
    }>);
}
export declare class CompileAnimationAnimateMetadata extends CompileAnimationMetadata {
    timings: string | number;
    styles: CompileAnimationStyleMetadata | CompileAnimationKeyframesSequenceMetadata;
    constructor(timings?: string | number, styles?: CompileAnimationStyleMetadata | CompileAnimationKeyframesSequenceMetadata);
}
export declare abstract class CompileAnimationWithStepsMetadata extends CompileAnimationMetadata {
    steps: CompileAnimationMetadata[];
    constructor(steps?: CompileAnimationMetadata[]);
}
export declare class CompileAnimationSequenceMetadata extends CompileAnimationWithStepsMetadata {
    constructor(steps?: CompileAnimationMetadata[]);
}
export declare class CompileAnimationGroupMetadata extends CompileAnimationWithStepsMetadata {
    constructor(steps?: CompileAnimationMetadata[]);
}
export declare class CompileIdentifierMetadata implements CompileMetadataWithIdentifier {
    reference: any;
    name: string;
    prefix: string;
    moduleUrl: string;
    value: any;
    constructor({reference, name, moduleUrl, prefix, value}?: {
        reference?: any;
        name?: string;
        moduleUrl?: string;
        prefix?: string;
        value?: any;
    });
    identifier: CompileIdentifierMetadata;
}
/**
 * A CompileSummary is the data needed to use a directive / pipe / module
 * in other modules / components. However, this data is not enough to compile
 * the directive / module itself.
 */
export interface CompileSummary {
    isSummary: boolean;
}
export declare class CompileDiDependencyMetadata {
    isAttribute: boolean;
    isSelf: boolean;
    isHost: boolean;
    isSkipSelf: boolean;
    isOptional: boolean;
    isValue: boolean;
    token: CompileTokenMetadata;
    value: any;
    constructor({isAttribute, isSelf, isHost, isSkipSelf, isOptional, isValue, token, value}?: {
        isAttribute?: boolean;
        isSelf?: boolean;
        isHost?: boolean;
        isSkipSelf?: boolean;
        isOptional?: boolean;
        isValue?: boolean;
        query?: CompileQueryMetadata;
        viewQuery?: CompileQueryMetadata;
        token?: CompileTokenMetadata;
        value?: any;
    });
}
export declare class CompileProviderMetadata {
    token: CompileTokenMetadata;
    useClass: CompileTypeMetadata;
    useValue: any;
    useExisting: CompileTokenMetadata;
    useFactory: CompileFactoryMetadata;
    deps: CompileDiDependencyMetadata[];
    multi: boolean;
    constructor({token, useClass, useValue, useExisting, useFactory, deps, multi}: {
        token?: CompileTokenMetadata;
        useClass?: CompileTypeMetadata;
        useValue?: any;
        useExisting?: CompileTokenMetadata;
        useFactory?: CompileFactoryMetadata;
        deps?: CompileDiDependencyMetadata[];
        multi?: boolean;
    });
}
export declare class CompileFactoryMetadata extends CompileIdentifierMetadata {
    diDeps: CompileDiDependencyMetadata[];
    constructor({reference, name, moduleUrl, prefix, diDeps, value}: {
        reference?: Function;
        name?: string;
        prefix?: string;
        moduleUrl?: string;
        value?: boolean;
        diDeps?: CompileDiDependencyMetadata[];
    });
}
export declare class CompileTokenMetadata implements CompileMetadataWithIdentifier {
    value: any;
    identifier: CompileIdentifierMetadata;
    identifierIsInstance: boolean;
    constructor({value, identifier, identifierIsInstance}: {
        value?: any;
        identifier?: CompileIdentifierMetadata;
        identifierIsInstance?: boolean;
    });
    reference: any;
    name: string;
}
/**
 * Metadata regarding compilation of a type.
 */
export declare class CompileTypeMetadata extends CompileIdentifierMetadata {
    isHost: boolean;
    diDeps: CompileDiDependencyMetadata[];
    lifecycleHooks: LifecycleHooks[];
    constructor({reference, name, moduleUrl, prefix, isHost, value, diDeps, lifecycleHooks}?: {
        reference?: Type<any>;
        name?: string;
        moduleUrl?: string;
        prefix?: string;
        isHost?: boolean;
        value?: any;
        diDeps?: CompileDiDependencyMetadata[];
        lifecycleHooks?: LifecycleHooks[];
    });
}
export declare class CompileQueryMetadata {
    selectors: Array<CompileTokenMetadata>;
    descendants: boolean;
    first: boolean;
    propertyName: string;
    read: CompileTokenMetadata;
    constructor({selectors, descendants, first, propertyName, read}?: {
        selectors?: Array<CompileTokenMetadata>;
        descendants?: boolean;
        first?: boolean;
        propertyName?: string;
        read?: CompileTokenMetadata;
    });
}
/**
 * Metadata about a stylesheet
 */
export declare class CompileStylesheetMetadata {
    moduleUrl: string;
    styles: string[];
    styleUrls: string[];
    constructor({moduleUrl, styles, styleUrls}?: {
        moduleUrl?: string;
        styles?: string[];
        styleUrls?: string[];
    });
}
/**
 * Summary Metadata regarding compilation of a template.
 */
export interface CompileTemplateSummary extends CompileSummary {
    isSummary: boolean;
    animations: string[];
    ngContentSelectors: string[];
    encapsulation: ViewEncapsulation;
}
/**
 * Metadata regarding compilation of a template.
 */
export declare class CompileTemplateMetadata {
    encapsulation: ViewEncapsulation;
    template: string;
    templateUrl: string;
    styles: string[];
    styleUrls: string[];
    externalStylesheets: CompileStylesheetMetadata[];
    animations: CompileAnimationEntryMetadata[];
    ngContentSelectors: string[];
    interpolation: [string, string];
    constructor({encapsulation, template, templateUrl, styles, styleUrls, externalStylesheets, animations, ngContentSelectors, interpolation}?: {
        encapsulation?: ViewEncapsulation;
        template?: string;
        templateUrl?: string;
        styles?: string[];
        styleUrls?: string[];
        externalStylesheets?: CompileStylesheetMetadata[];
        ngContentSelectors?: string[];
        animations?: CompileAnimationEntryMetadata[];
        interpolation?: [string, string];
    });
    toSummary(): CompileTemplateSummary;
}
export interface CompileDirectiveSummary extends CompileSummary {
    isSummary: boolean;
    type: CompileTypeMetadata;
    isComponent: boolean;
    selector: string;
    exportAs: string;
    inputs: {
        [key: string]: string;
    };
    outputs: {
        [key: string]: string;
    };
    hostListeners: {
        [key: string]: string;
    };
    hostProperties: {
        [key: string]: string;
    };
    hostAttributes: {
        [key: string]: string;
    };
    providers: CompileProviderMetadata[];
    viewProviders: CompileProviderMetadata[];
    queries: CompileQueryMetadata[];
    entryComponents: CompileIdentifierMetadata[];
    changeDetection: ChangeDetectionStrategy;
    template: CompileTemplateSummary;
}
/**
 * Metadata regarding compilation of a directive.
 */
export declare class CompileDirectiveMetadata implements CompileMetadataWithIdentifier {
    static create({type, isComponent, selector, exportAs, changeDetection, inputs, outputs, host, providers, viewProviders, queries, viewQueries, entryComponents, template}?: {
        type?: CompileTypeMetadata;
        isComponent?: boolean;
        selector?: string;
        exportAs?: string;
        changeDetection?: ChangeDetectionStrategy;
        inputs?: string[];
        outputs?: string[];
        host?: {
            [key: string]: string;
        };
        providers?: Array<CompileProviderMetadata | CompileTypeMetadata | CompileIdentifierMetadata | any[]>;
        viewProviders?: Array<CompileProviderMetadata | CompileTypeMetadata | CompileIdentifierMetadata | any[]>;
        queries?: CompileQueryMetadata[];
        viewQueries?: CompileQueryMetadata[];
        entryComponents?: CompileIdentifierMetadata[];
        template?: CompileTemplateMetadata;
    }): CompileDirectiveMetadata;
    type: CompileTypeMetadata;
    isComponent: boolean;
    selector: string;
    exportAs: string;
    changeDetection: ChangeDetectionStrategy;
    inputs: {
        [key: string]: string;
    };
    outputs: {
        [key: string]: string;
    };
    hostListeners: {
        [key: string]: string;
    };
    hostProperties: {
        [key: string]: string;
    };
    hostAttributes: {
        [key: string]: string;
    };
    providers: CompileProviderMetadata[];
    viewProviders: CompileProviderMetadata[];
    queries: CompileQueryMetadata[];
    viewQueries: CompileQueryMetadata[];
    entryComponents: CompileIdentifierMetadata[];
    template: CompileTemplateMetadata;
    constructor({type, isComponent, selector, exportAs, changeDetection, inputs, outputs, hostListeners, hostProperties, hostAttributes, providers, viewProviders, queries, viewQueries, entryComponents, template}?: {
        type?: CompileTypeMetadata;
        isComponent?: boolean;
        selector?: string;
        exportAs?: string;
        changeDetection?: ChangeDetectionStrategy;
        inputs?: {
            [key: string]: string;
        };
        outputs?: {
            [key: string]: string;
        };
        hostListeners?: {
            [key: string]: string;
        };
        hostProperties?: {
            [key: string]: string;
        };
        hostAttributes?: {
            [key: string]: string;
        };
        providers?: Array<CompileProviderMetadata | CompileTypeMetadata | CompileIdentifierMetadata | any[]>;
        viewProviders?: Array<CompileProviderMetadata | CompileTypeMetadata | CompileIdentifierMetadata | any[]>;
        queries?: CompileQueryMetadata[];
        viewQueries?: CompileQueryMetadata[];
        entryComponents?: CompileIdentifierMetadata[];
        template?: CompileTemplateMetadata;
    });
    identifier: CompileIdentifierMetadata;
    toSummary(): CompileDirectiveSummary;
}
/**
 * Construct {@link CompileDirectiveMetadata} from {@link ComponentTypeMetadata} and a selector.
 */
export declare function createHostComponentMeta(compMeta: CompileDirectiveMetadata): CompileDirectiveMetadata;
export interface CompilePipeSummary extends CompileSummary {
    isSummary: boolean;
    type: CompileTypeMetadata;
    name: string;
    pure: boolean;
}
export declare class CompilePipeMetadata implements CompileMetadataWithIdentifier {
    type: CompileTypeMetadata;
    name: string;
    pure: boolean;
    constructor({type, name, pure}?: {
        type?: CompileTypeMetadata;
        name?: string;
        pure?: boolean;
    });
    identifier: CompileIdentifierMetadata;
    toSummary(): CompilePipeSummary;
}
export interface CompileNgModuleInjectorSummary extends CompileSummary {
    isSummary: boolean;
    type: CompileTypeMetadata;
    entryComponents: CompileIdentifierMetadata[];
    providers: CompileProviderMetadata[];
    importedModules: CompileNgModuleInjectorSummary[];
    exportedModules: CompileNgModuleInjectorSummary[];
}
export interface CompileNgModuleDirectiveSummary extends CompileSummary {
    isSummary: boolean;
    type: CompileTypeMetadata;
    exportedDirectives: CompileIdentifierMetadata[];
    exportedPipes: CompileIdentifierMetadata[];
    exportedModules: CompileNgModuleDirectiveSummary[];
    loadingPromises: Promise<any>[];
}
export declare type CompileNgModuleSummary = CompileNgModuleInjectorSummary & CompileNgModuleDirectiveSummary;
/**
 * Metadata regarding compilation of a module.
 */
export declare class CompileNgModuleMetadata implements CompileMetadataWithIdentifier {
    type: CompileTypeMetadata;
    declaredDirectives: CompileIdentifierMetadata[];
    exportedDirectives: CompileIdentifierMetadata[];
    declaredPipes: CompileIdentifierMetadata[];
    exportedPipes: CompileIdentifierMetadata[];
    entryComponents: CompileIdentifierMetadata[];
    bootstrapComponents: CompileIdentifierMetadata[];
    providers: CompileProviderMetadata[];
    importedModules: CompileNgModuleSummary[];
    exportedModules: CompileNgModuleSummary[];
    schemas: SchemaMetadata[];
    id: string;
    transitiveModule: TransitiveCompileNgModuleMetadata;
    constructor({type, providers, declaredDirectives, exportedDirectives, declaredPipes, exportedPipes, entryComponents, bootstrapComponents, importedModules, exportedModules, schemas, transitiveModule, id}?: {
        type?: CompileTypeMetadata;
        providers?: Array<CompileProviderMetadata | CompileTypeMetadata | CompileIdentifierMetadata | any[]>;
        declaredDirectives?: CompileIdentifierMetadata[];
        exportedDirectives?: CompileIdentifierMetadata[];
        declaredPipes?: CompileIdentifierMetadata[];
        exportedPipes?: CompileIdentifierMetadata[];
        entryComponents?: CompileIdentifierMetadata[];
        bootstrapComponents?: CompileIdentifierMetadata[];
        importedModules?: CompileNgModuleSummary[];
        exportedModules?: CompileNgModuleSummary[];
        transitiveModule?: TransitiveCompileNgModuleMetadata;
        schemas?: SchemaMetadata[];
        id?: string;
    });
    identifier: CompileIdentifierMetadata;
    toSummary(): CompileNgModuleSummary;
    toInjectorSummary(): CompileNgModuleInjectorSummary;
    toDirectiveSummary(): CompileNgModuleDirectiveSummary;
}
export declare class TransitiveCompileNgModuleMetadata {
    modules: CompileNgModuleInjectorSummary[];
    providers: CompileProviderMetadata[];
    entryComponents: CompileIdentifierMetadata[];
    directives: CompileIdentifierMetadata[];
    pipes: CompileIdentifierMetadata[];
    loadingPromises: Promise<any>[];
    directivesSet: Set<any>;
    pipesSet: Set<any>;
    constructor(modules: CompileNgModuleInjectorSummary[], providers: CompileProviderMetadata[], entryComponents: CompileIdentifierMetadata[], directives: CompileIdentifierMetadata[], pipes: CompileIdentifierMetadata[], loadingPromises: Promise<any>[]);
}
export declare function removeIdentifierDuplicates<T extends CompileMetadataWithIdentifier>(items: T[]): T[];
export declare function isStaticSymbol(value: any): value is StaticSymbol;
export interface StaticSymbol {
    name: string;
    filePath: string;
}
export declare class ProviderMeta {
    token: any;
    useClass: Type<any>;
    useValue: any;
    useExisting: any;
    useFactory: Function;
    dependencies: Object[];
    multi: boolean;
    constructor(token: any, {useClass, useValue, useExisting, useFactory, deps, multi}: {
        useClass?: Type<any>;
        useValue?: any;
        useExisting?: any;
        useFactory?: Function;
        deps?: Object[];
        multi?: boolean;
    });
}
