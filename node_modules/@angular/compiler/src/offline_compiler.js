/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationCompiler } from './animation/animation_compiler';
import { CompileProviderMetadata, createHostComponentMeta } from './compile_metadata';
import { ListWrapper } from './facade/collection';
import { Identifiers, resolveIdentifier, resolveIdentifierToken } from './identifiers';
import * as o from './output/output_ast';
import { ComponentFactoryDependency, DirectiveWrapperDependency, ViewClassDependency } from './view_compiler/view_compiler';
export var SourceModule = (function () {
    function SourceModule(fileUrl, moduleUrl, source) {
        this.fileUrl = fileUrl;
        this.moduleUrl = moduleUrl;
        this.source = source;
    }
    return SourceModule;
}());
// Returns all the source files and a mapping from modules to directives
export function analyzeNgModules(programStaticSymbols, options, metadataResolver) {
    return _loadNgModules(programStaticSymbols, options, metadataResolver).then(_analyzeNgModules);
}
function _analyzeNgModules(ngModuleMetas) {
    var moduleMetasByRef = new Map();
    ngModuleMetas.forEach(function (ngModule) { return moduleMetasByRef.set(ngModule.type.reference, ngModule); });
    var ngModuleByPipeOrDirective = new Map();
    var ngModulesByFile = new Map();
    var ngDirectivesByFile = new Map();
    var filePaths = new Set();
    // Looping over all modules to construct:
    // - a map from file to modules `ngModulesByFile`,
    // - a map from file to directives `ngDirectivesByFile`,
    // - a map from directive/pipe to module `ngModuleByPipeOrDirective`.
    ngModuleMetas.forEach(function (ngModuleMeta) {
        var srcFileUrl = ngModuleMeta.type.reference.filePath;
        filePaths.add(srcFileUrl);
        ngModulesByFile.set(srcFileUrl, (ngModulesByFile.get(srcFileUrl) || []).concat(ngModuleMeta.type.reference));
        ngModuleMeta.declaredDirectives.forEach(function (dirIdentifier) {
            var fileUrl = dirIdentifier.reference.filePath;
            filePaths.add(fileUrl);
            ngDirectivesByFile.set(fileUrl, (ngDirectivesByFile.get(fileUrl) || []).concat(dirIdentifier.reference));
            ngModuleByPipeOrDirective.set(dirIdentifier.reference, ngModuleMeta);
        });
        ngModuleMeta.declaredPipes.forEach(function (pipeIdentifier) {
            var fileUrl = pipeIdentifier.reference.filePath;
            filePaths.add(fileUrl);
            ngModuleByPipeOrDirective.set(pipeIdentifier.reference, ngModuleMeta);
        });
    });
    var files = [];
    filePaths.forEach(function (srcUrl) {
        var directives = ngDirectivesByFile.get(srcUrl) || [];
        var ngModules = ngModulesByFile.get(srcUrl) || [];
        files.push({ srcUrl: srcUrl, directives: directives, ngModules: ngModules });
    });
    return {
        // map directive/pipe to module
        ngModuleByPipeOrDirective: ngModuleByPipeOrDirective,
        // list modules and directives for every source file
        files: files,
    };
}
export var OfflineCompiler = (function () {
    function OfflineCompiler(_metadataResolver, _templateParser, _styleCompiler, _viewCompiler, _dirWrapperCompiler, _ngModuleCompiler, _outputEmitter, _localeId, _translationFormat, _animationParser) {
        this._metadataResolver = _metadataResolver;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._dirWrapperCompiler = _dirWrapperCompiler;
        this._ngModuleCompiler = _ngModuleCompiler;
        this._outputEmitter = _outputEmitter;
        this._localeId = _localeId;
        this._translationFormat = _translationFormat;
        this._animationParser = _animationParser;
        this._animationCompiler = new AnimationCompiler();
    }
    OfflineCompiler.prototype.clearCache = function () { this._metadataResolver.clearCache(); };
    OfflineCompiler.prototype.compileModules = function (staticSymbols, options) {
        var _this = this;
        return analyzeNgModules(staticSymbols, options, this._metadataResolver)
            .then(function (_a) {
            var ngModuleByPipeOrDirective = _a.ngModuleByPipeOrDirective, files = _a.files;
            var sourceModules = files.map(function (file) { return _this._compileSrcFile(file.srcUrl, ngModuleByPipeOrDirective, file.directives, file.ngModules); });
            return ListWrapper.flatten(sourceModules);
        });
    };
    OfflineCompiler.prototype._compileSrcFile = function (srcFileUrl, ngModuleByPipeOrDirective, directives, ngModules) {
        var _this = this;
        var fileSuffix = _splitTypescriptSuffix(srcFileUrl)[1];
        var statements = [];
        var exportedVars = [];
        var outputSourceModules = [];
        // compile all ng modules
        exportedVars.push.apply(exportedVars, ngModules.map(function (ngModuleType) { return _this._compileModule(ngModuleType, statements); }));
        // compile directive wrappers
        exportedVars.push.apply(exportedVars, directives.map(function (directiveType) { return _this._compileDirectiveWrapper(directiveType, statements); }));
        // compile components
        directives.forEach(function (dirType) {
            var compMeta = _this._metadataResolver.getDirectiveMetadata(dirType);
            if (!compMeta.isComponent) {
                return Promise.resolve(null);
            }
            var ngModule = ngModuleByPipeOrDirective.get(dirType);
            if (!ngModule) {
                throw new Error("Internal Error: cannot determine the module for component " + compMeta.type.name + "!");
            }
            _assertComponent(compMeta);
            // compile styles
            var stylesCompileResults = _this._styleCompiler.compileComponent(compMeta);
            stylesCompileResults.externalStylesheets.forEach(function (compiledStyleSheet) {
                outputSourceModules.push(_this._codgenStyles(srcFileUrl, compiledStyleSheet, fileSuffix));
            });
            // compile components
            exportedVars.push(_this._compileComponentFactory(compMeta, ngModule, fileSuffix, statements), _this._compileComponent(compMeta, ngModule, ngModule.transitiveModule.directives, stylesCompileResults.componentStylesheet, fileSuffix, statements));
        });
        if (statements.length > 0) {
            var srcModule = this._codegenSourceModule(srcFileUrl, _ngfactoryModuleUrl(srcFileUrl), statements, exportedVars);
            outputSourceModules.unshift(srcModule);
        }
        return outputSourceModules;
    };
    OfflineCompiler.prototype._compileModule = function (ngModuleType, targetStatements) {
        var ngModule = this._metadataResolver.getNgModuleMetadata(ngModuleType);
        var providers = [];
        if (this._localeId) {
            providers.push(new CompileProviderMetadata({
                token: resolveIdentifierToken(Identifiers.LOCALE_ID),
                useValue: this._localeId,
            }));
        }
        if (this._translationFormat) {
            providers.push(new CompileProviderMetadata({
                token: resolveIdentifierToken(Identifiers.TRANSLATIONS_FORMAT),
                useValue: this._translationFormat
            }));
        }
        var appCompileResult = this._ngModuleCompiler.compile(ngModule, providers);
        appCompileResult.dependencies.forEach(function (dep) {
            dep.placeholder.name = _componentFactoryName(dep.comp);
            dep.placeholder.moduleUrl = _ngfactoryModuleUrl(dep.comp.moduleUrl);
        });
        targetStatements.push.apply(targetStatements, appCompileResult.statements);
        return appCompileResult.ngModuleFactoryVar;
    };
    OfflineCompiler.prototype._compileDirectiveWrapper = function (directiveType, targetStatements) {
        var dirMeta = this._metadataResolver.getDirectiveMetadata(directiveType);
        var dirCompileResult = this._dirWrapperCompiler.compile(dirMeta);
        targetStatements.push.apply(targetStatements, dirCompileResult.statements);
        return dirCompileResult.dirWrapperClassVar;
    };
    OfflineCompiler.prototype._compileComponentFactory = function (compMeta, ngModule, fileSuffix, targetStatements) {
        var hostMeta = createHostComponentMeta(compMeta);
        var hostViewFactoryVar = this._compileComponent(hostMeta, ngModule, [compMeta.type], null, fileSuffix, targetStatements);
        var compFactoryVar = _componentFactoryName(compMeta.type);
        targetStatements.push(o.variable(compFactoryVar)
            .set(o.importExpr(resolveIdentifier(Identifiers.ComponentFactory), [o.importType(compMeta.type)])
            .instantiate([
            o.literal(compMeta.selector),
            o.variable(hostViewFactoryVar),
            o.importExpr(compMeta.type),
        ], o.importType(resolveIdentifier(Identifiers.ComponentFactory), [o.importType(compMeta.type)], [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]));
        return compFactoryVar;
    };
    OfflineCompiler.prototype._compileComponent = function (compMeta, ngModule, directiveIdentifiers, componentStyles, fileSuffix, targetStatements) {
        var _this = this;
        var parsedAnimations = this._animationParser.parseComponent(compMeta);
        var directives = directiveIdentifiers.map(function (dir) { return _this._metadataResolver.getDirectiveSummary(dir.reference); });
        var pipes = ngModule.transitiveModule.pipes.map(function (pipe) { return _this._metadataResolver.getPipeSummary(pipe.reference); });
        var parsedTemplate = this._templateParser.parse(compMeta, compMeta.template.template, directives, pipes, ngModule.schemas, compMeta.type.name);
        var stylesExpr = componentStyles ? o.variable(componentStyles.stylesVar) : o.literalArr([]);
        var compiledAnimations = this._animationCompiler.compile(compMeta.type.name, parsedAnimations);
        var viewResult = this._viewCompiler.compileComponent(compMeta, parsedTemplate, stylesExpr, pipes, compiledAnimations);
        if (componentStyles) {
            targetStatements.push.apply(targetStatements, _resolveStyleStatements(componentStyles, fileSuffix));
        }
        compiledAnimations.forEach(function (entry) { return targetStatements.push.apply(targetStatements, entry.statements); });
        targetStatements.push.apply(targetStatements, _resolveViewStatements(viewResult));
        return viewResult.viewClassVar;
    };
    OfflineCompiler.prototype._codgenStyles = function (fileUrl, stylesCompileResult, fileSuffix) {
        _resolveStyleStatements(stylesCompileResult, fileSuffix);
        return this._codegenSourceModule(fileUrl, _stylesModuleUrl(stylesCompileResult.meta.moduleUrl, stylesCompileResult.isShimmed, fileSuffix), stylesCompileResult.statements, [stylesCompileResult.stylesVar]);
    };
    OfflineCompiler.prototype._codegenSourceModule = function (fileUrl, moduleUrl, statements, exportedVars) {
        return new SourceModule(fileUrl, moduleUrl, this._outputEmitter.emitStatements(moduleUrl, statements, exportedVars));
    };
    return OfflineCompiler;
}());
function _resolveViewStatements(compileResult) {
    compileResult.dependencies.forEach(function (dep) {
        if (dep instanceof ViewClassDependency) {
            var vfd = dep;
            vfd.placeholder.moduleUrl = _ngfactoryModuleUrl(vfd.comp.moduleUrl);
        }
        else if (dep instanceof ComponentFactoryDependency) {
            var cfd = dep;
            cfd.placeholder.name = _componentFactoryName(cfd.comp);
            cfd.placeholder.moduleUrl = _ngfactoryModuleUrl(cfd.comp.moduleUrl);
        }
        else if (dep instanceof DirectiveWrapperDependency) {
            var dwd = dep;
            dwd.placeholder.moduleUrl = _ngfactoryModuleUrl(dwd.dir.moduleUrl);
        }
    });
    return compileResult.statements;
}
function _resolveStyleStatements(compileResult, fileSuffix) {
    compileResult.dependencies.forEach(function (dep) {
        dep.valuePlaceholder.moduleUrl = _stylesModuleUrl(dep.moduleUrl, dep.isShimmed, fileSuffix);
    });
    return compileResult.statements;
}
function _ngfactoryModuleUrl(dirUrl) {
    var urlWithSuffix = _splitTypescriptSuffix(dirUrl);
    return urlWithSuffix[0] + ".ngfactory" + urlWithSuffix[1];
}
function _componentFactoryName(comp) {
    return comp.name + "NgFactory";
}
function _stylesModuleUrl(stylesheetUrl, shim, suffix) {
    return shim ? stylesheetUrl + ".shim" + suffix : "" + stylesheetUrl + suffix;
}
function _assertComponent(meta) {
    if (!meta.isComponent) {
        throw new Error("Could not compile '" + meta.type.name + "' because it is not a component.");
    }
}
function _splitTypescriptSuffix(path) {
    if (path.endsWith('.d.ts')) {
        return [path.slice(0, -5), '.ts'];
    }
    var lastDot = path.lastIndexOf('.');
    if (lastDot !== -1) {
        return [path.substring(0, lastDot), path.substring(lastDot)];
    }
    return [path, ''];
}
// Load the NgModules and check
// that all directives / pipes that are present in the program
// are also declared by a module.
function _loadNgModules(programStaticSymbols, options, metadataResolver) {
    var ngModules = new Map();
    var programPipesAndDirectives = [];
    var ngModulePipesAndDirective = new Set();
    var loadingPromises = [];
    var addNgModule = function (staticSymbol) {
        if (ngModules.has(staticSymbol)) {
            return false;
        }
        var _a = metadataResolver.loadNgModuleMetadata(staticSymbol, false, false), ngModule = _a.ngModule, loading = _a.loading;
        if (ngModule) {
            ngModules.set(ngModule.type.reference, ngModule);
            loadingPromises.push(loading);
            ngModule.declaredDirectives.forEach(function (dir) { return ngModulePipesAndDirective.add(dir.reference); });
            ngModule.declaredPipes.forEach(function (pipe) { return ngModulePipesAndDirective.add(pipe.reference); });
            if (options.transitiveModules) {
                // For every input modules add the list of transitively included modules
                ngModule.transitiveModule.modules.forEach(function (modMeta) { return addNgModule(modMeta.type.reference); });
            }
        }
        return !!ngModule;
    };
    programStaticSymbols.forEach(function (staticSymbol) {
        if (!addNgModule(staticSymbol) &&
            (metadataResolver.isDirective(staticSymbol) || metadataResolver.isPipe(staticSymbol))) {
            programPipesAndDirectives.push(staticSymbol);
        }
    });
    // Throw an error if any of the program pipe or directives is not declared by a module
    var symbolsMissingModule = programPipesAndDirectives.filter(function (s) { return !ngModulePipesAndDirective.has(s); });
    if (symbolsMissingModule.length) {
        var messages = symbolsMissingModule.map(function (s) { return ("Cannot determine the module for class " + s.name + " in " + s.filePath + "!"); });
        throw new Error(messages.join('\n'));
    }
    return Promise.all(loadingPromises).then(function () { return Array.from(ngModules.values()); });
}
//# sourceMappingURL=offline_compiler.js.map