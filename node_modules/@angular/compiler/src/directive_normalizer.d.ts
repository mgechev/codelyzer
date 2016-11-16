/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ViewEncapsulation } from '@angular/core';
import { CompileAnimationEntryMetadata, CompileDirectiveMetadata, CompileStylesheetMetadata, CompileTemplateMetadata } from './compile_metadata';
import { CompilerConfig } from './config';
import { HtmlParser } from './ml_parser/html_parser';
import { ResourceLoader } from './resource_loader';
import { UrlResolver } from './url_resolver';
import { SyncAsyncResult } from './util';
export interface PrenormalizedTemplateMetadata {
    componentType: any;
    moduleUrl: string;
    template?: string;
    templateUrl?: string;
    styles?: string[];
    styleUrls?: string[];
    interpolation?: [string, string];
    encapsulation?: ViewEncapsulation;
    animations?: CompileAnimationEntryMetadata[];
}
export declare class DirectiveNormalizer {
    private _resourceLoader;
    private _urlResolver;
    private _htmlParser;
    private _config;
    private _resourceLoaderCache;
    constructor(_resourceLoader: ResourceLoader, _urlResolver: UrlResolver, _htmlParser: HtmlParser, _config: CompilerConfig);
    clearCache(): void;
    clearCacheFor(normalizedDirective: CompileDirectiveMetadata): void;
    private _fetch(url);
    normalizeTemplate(prenormData: PrenormalizedTemplateMetadata): SyncAsyncResult<CompileTemplateMetadata>;
    normalizeTemplateSync(prenomData: PrenormalizedTemplateMetadata): CompileTemplateMetadata;
    normalizeTemplateAsync(prenomData: PrenormalizedTemplateMetadata): Promise<CompileTemplateMetadata>;
    normalizeLoadedTemplate(prenomData: PrenormalizedTemplateMetadata, template: string, templateAbsUrl: string): CompileTemplateMetadata;
    normalizeExternalStylesheets(templateMeta: CompileTemplateMetadata): Promise<CompileTemplateMetadata>;
    private _loadMissingExternalStylesheets(styleUrls, loadedStylesheets?);
    normalizeStylesheet(stylesheet: CompileStylesheetMetadata): CompileStylesheetMetadata;
}
