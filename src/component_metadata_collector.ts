import 'reflect-metadata';

import * as ts from 'typescript';
import * as fs from 'fs';

import {FileCache} from './util/file_cache';
import {CollectComponentMetadataWalker} from './walkers/collect_component_metadata_walker';
import {RecursiveReferenceExtractorStrategy} from './reference_extractors/recursive_reference_extractor_strategy';

export class ComponentMetadataCollector {
  private lsHost: ts.LanguageServiceHost;
  private ls: ts.LanguageService;
  private fileCache: FileCache;
  constructor() {
    this.lsHost = {
      getCompilationSettings: () => { return {}; },
      getScriptFileNames: () => this.fileCache.getFileNames(),
      getScriptVersion: (fileName: string) => this.fileCache.getScriptInfo(fileName).version.toString(),
      getScriptSnapshot: (fileName: string) => this.fileCache.getScriptSnapshot(fileName),
      getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
      getDefaultLibFileName:
        (options: ts.CompilerOptions) => ts.getDefaultLibFileName(options),
      log: (message) => undefined,
      trace: (message) => undefined,
      error: (message) => console.error(message)
    };
    this.ls = ts.createLanguageService(this.lsHost, ts.createDocumentRegistry());
    this.fileCache = new FileCache();
    this.fileCache.ls = this.ls;
  }
  getComponentTree(rootFile: string) {
    let walker = new CollectComponentMetadataWalker(new RecursiveReferenceExtractorStrategy(this.fileCache, this.ls));
    let file = ts.createSourceFile(rootFile, fs.readFileSync(rootFile).toString(), ts.ScriptTarget.ES2015, true);
    return walker.getMetadata(file);
  }
}
