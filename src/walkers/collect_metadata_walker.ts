import * as ts from 'typescript';
import 'reflect-metadata';
import {ComponentMetadata, DirectiveMetadata} from 'angular2/core';
import {SyntaxWalker} from './syntax_walker';
import {FileCache} from '../util/file_cache';
import * as fs from 'fs';

function getPropValue(p) {
  if (p.initializer.kind === ts.SyntaxKind.StringLiteral) {
    return p.initializer.text;
  }
  return null;
}

function getArrayLiteralValue(n) {
  if (n.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
    return n.initializer.elements.map(e => e.text);
  }
  return null;
}


function getObjectLiteralValue(n) {
  if (n.initializer.kind === ts.SyntaxKind.ObjectLiteralExpression) {
    return n.initializer.properties.reduce((p, c) => {
      p[c.name.text] = c.initializer.text;
      return p;
    }, {});
  }
  return null;
}

const PROP_MAP = {
  outputs: '_events',
  events: '_events',
  inputs: '_properties',
  properties: '_properties',
  host: 'host',
  selector: 'selector',
  directives: 'directives'
};

export class DirectiveInfo {
  metadata: DirectiveMetadata;
  classDeclaration: ts.ClassDeclaration;
}

const classMetadataValueExtracter = {
  selector: getPropValue,
  inputs: getArrayLiteralValue,
  outputs: getArrayLiteralValue,
  host: getObjectLiteralValue
};

export class CollectComponentsMetadata {
  lsHost;
  ls;
  fileCache: FileCache;
  constructor() {
    this.lsHost = {
      getCompilationSettings: () => { return {}; },
      getScriptFileNames: () => this.fileCache.getFileNames(),
      getScriptVersion: (fileName: string) => this.fileCache.getScriptInfo(fileName).version.toString(),
      getScriptIsOpen: (fileName: string) => this.fileCache.getScriptInfo(fileName).isOpen,
      getScriptSnapshot: (fileName: string) => this.fileCache.getScriptSnapshot(fileName),
      getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
      getDefaultLibFileName:
        (options: ts.CompilerOptions) => ts.getDefaultLibFileName(options),
      log: (message) => undefined,
      trace: (message) => undefined,
      error: (message) => console.error(message)
    };
    this.ls = ts.createLanguageService(this.lsHost, ts.createDocumentRegistry());
    this.fileCache.ls = this.ls;
  }
  getDirectivesTree(rootFile: string) {
    let walker = new CollectComponentMetadataWalker(new RecursiveDirectiveExtractorStrategy(this.fileCache, this.ls));
    let file = ts.createSourceFile(rootFile, fs.readFileSync(rootFile).toString(), ts.ScriptTarget.ES2015, true);
    return walker.getComponentsMetadata(file);
  }
}

export abstract class DirectivesExtractorStrategy {
  abstract extract(nodes: ts.Identifier[], file): any[];
}

export class BasicDirectiveExtractorStrategy extends DirectivesExtractorStrategy {
  extract(nodes: ts.Identifier[], file): any[] {
    return nodes.map(n => n.text);
  }
}

export class RecursiveDirectiveExtractorStrategy extends DirectivesExtractorStrategy {
  constructor(private fileCache, private ls) {
    super();
  }
  extract(nodes: ts.Identifier[], file): any[] {
    return nodes.map(node => {
      let locs = this.ls.getDefinitionAtPosition(file, node.pos);
      let info = locs && locs.map( def => ({
        def: def,
        file: def && def.fileName,
        min: def && this.fileCache.positionToLineCol(def.fileName,def.textSpan.start),
        lim: def && this.fileCache.positionToLineCol(def.fileName,ts.textSpanEnd(def.textSpan))
      }));
      if (locs && info[0] && info[0].file) {
        let file = ts.createSourceFile(info[0].file, fs.readFileSync(info[0].file).toString(), ts.ScriptTarget.ES2015, true);
        let visitor = new CollectComponentMetadataWalker(new RecursiveDirectiveExtractorStrategy(this.fileCache, this.ls));
        return visitor.getComponentsMetadata(file, [node.text]).pop();
      }
      return null;
    });
  }
}

export class CollectComponentMetadataWalker extends SyntaxWalker {
  directives: DirectiveInfo[] = [];
  private currentDirective;
  private directivesName: string[];
  private file;
  constructor(private directivesExtractorStrategy: DirectivesExtractorStrategy = new BasicDirectiveExtractorStrategy()) {
    super();
  }
  getComponentsMetadata(file, directivesName?: string[]): DirectiveInfo[] {
    this.directivesName = directivesName;
    this.file = file;
    this.walk(file);
    return this.directives;
  }
  protected visitPropertyDeclaration(node: ts.PropertyDeclaration) {
    let res = this.extractDecorators(node, /^HostBinding/);
    this.collectHostBindingMetadata(res.node, res.args[0]);
    super.visitPropertyDeclaration(node);
  }
  protected visitMethodDeclaration(node: ts.MethodDeclaration) {
    let res = this.extractDecorators(node, /^HostListener$/);
    this.collectHostListenerMetadata(res.node, res.args);
    super.visitMethodDeclaration(node);
  }
  protected visitClassDeclaration(node: ts.ClassDeclaration) {
    if (!this.directivesName || this.directivesName.indexOf(node.name.text) >= 0) {
      this.currentDirective = new DirectiveInfo();
      this.currentDirective.classDeclaration = node;
      let res = this.extractDecorators(node, /^(Component|Directive)$/);
      this.collectClassDecoratorMetadata(res.node, res.name, res.args[0]);
      super.visitClassDeclaration(node);
      this.directives.push(this.currentDirective);
    }
  }
  private extractDecorators(node: any, decoratorRegexp) {
    return (node.decorators || []).map(d => {
      let baseExpr = <any>d.expression || {};
      let expr = baseExpr.expression || {};
      let name = expr.text;
      let args = baseExpr.arguments || [];
      if (decoratorRegexp.test(name)) {
        return {
          args, name, node
        };
      }
      return null;
    }).find(r => !!r);
  }
  private collectClassDecoratorMetadata(node, decoratorName, decoratorArg) {
    if (decoratorName === 'Directive') {
      this.currentDirective.metadata = new DirectiveMetadata();
    } else {
      this.currentDirective.metadata = new ComponentMetadata();
    }
    if (decoratorArg.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      decoratorArg.properties.forEach(prop => {
        let name = prop.name.text;
        if (name === 'directives') {
          this.currentDirective.metadata[name] = this.directivesExtractorStrategy.extract(prop.initializer.elements, this.file);
        } else {
          let extracter = classMetadataValueExtracter[name];
          if (extracter && PROP_MAP[name]) {
            this.currentDirective.metadata[PROP_MAP[name]] = extracter(prop);
          } else {
            console.log(`Cannot extract value for ${name}`);
          }
        }
      });
    }
  }
  private collectHostBindingMetadata(node, decoratorArg) {
    let propName = node.name.text;
    if (!decoratorArg || decoratorArg.kind === ts.SyntaxKind.StringLiteral) {
      this.currentDirective.metadata.host = this.currentDirective.metadata.host || {};
      this.currentDirective.metadata.host[`[${(decoratorArg && decoratorArg.text) || propName}]`] = propName;
    } else {
      console.log('Unsupported construct');
    }
  }
  private collectHostListenerMetadata(node, decoratorArgs) {
    let methodName = node.name.text;
    if (decoratorArgs[0].kind === ts.SyntaxKind.StringLiteral) {
      this.currentDirective.metadata.host = this.currentDirective.metadata.host || {};
      this.currentDirective.metadata.host[`(${decoratorArgs[0].text})`] = `${methodName}()`;
    }
  }
}
