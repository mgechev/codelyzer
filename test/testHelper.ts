import * as ts from 'typescript';
import * as tslint from 'tslint';
import chai = require('chai');
import {dirname} from 'path';
import {readFileSync, existsSync} from 'fs';

export type File = string;
export type Path = string;
export type Project = {[key: string]: string};

const moduleCache = new Map<string, string>();
const existenceCache = new Map<string, boolean>();

const isNodeModule = (filename: string) => filename.startsWith('node_module');

export class CompilerHost implements ts.CompilerHost {
  private currentDir = '';

  constructor(public project: Project, private options: ts.CompilerOptions) {}

  useCaseSensitiveFileNames() {
    return true;
  }

  getNewLine() {
    return '\n';
  }

  getSourceFile(filename: string, version: ts.ScriptTarget) {
    return ts.createSourceFile(filename, this.readFile(filename), version, true);
  }

  readFile(filename: string) {
    if (isNodeModule(filename) || filename === this.getDefaultLibFileName()) {
      return '';
    }
    return this.project[filename];
  }

  fileExists(filename: string) {
    if (isNodeModule(filename)) {
      return true;
    }
    return !!this.project[filename];
  }

  getDefaultLibFileName() {
    return ts.getDefaultLibFileName(this.options);
  }

  getCompilationSettings() {
    return this.options;
  }

  getCurrentDirectory() {
    return this.currentDir;
  }

  getScriptFileNames() {
    const iter = Object.keys(this.project);
    const result = [];
    for (let file of iter) {
      result.push(file);
    }
    return result;
  }

  writeFile(file: string, content: string) {
    this.project[file] = content;
  }

  getScriptSnapshot(name: string) {
    const content = this.readFile(name);
    return ts.ScriptSnapshot.fromString(content);
  }

  getDirectories() {
    return [];
  }

  getCanonicalFileName(name: string) {
    return name;
  }
}

export const getProgram = (project: Project, config: any, root: string = ''): ts.Program => {
  const filenames = Object.keys(project);
  // Any because of different APIs in TypeScript 2.1 and 2.0
  const parseConfigHost: any = {
    fileExists: (path: string) => true,
    readFile: (file) => null,
    readDirectory: (dir: string) => [],
    useCaseSensitiveFileNames: true,
  };
  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, root);
  parsed.options.baseUrl = parsed.options.baseUrl || root;
  parsed.options.allowJs = true;
  parsed.options.target = ts.ScriptTarget.ES5;
  parsed.options.module = ts.ModuleKind.CommonJS;
  parsed.options.declaration = false;
  parsed.options.emitDecoratorMetadata = true;
  parsed.options.experimentalDecorators = true;
  const host = new CompilerHost(project, parsed.options);
  const program = ts.createProgram(filenames, parsed.options, host);
  return program;
};

interface ISourcePosition {
  line: number;
  character: number;
}

export interface IExpectedFailure {
  message: string;
  startPosition: ISourcePosition;
  endPosition: ISourcePosition;
}

function lint(ruleName: string, source: string, options): tslint.LintResult {
  let configuration = {
    rules: {}
  };
  if (options !== null && options.length >= 0) {
    configuration.rules[ruleName] = (<any[]>[true]).concat(options);
  } else {
    configuration.rules[ruleName] = true;
  }
  var linterOptions: tslint.ILinterOptions = {
    formatter: 'json',
    rulesDirectory: './dist/src',
    formattersDirectory: null,
    fix: false
  };
  let project: Project = {
    'file.ts': source
  };
  let linter: tslint.Linter = new tslint.Linter(linterOptions, getProgram(project, {}));
  linter.lint('file.ts', source, configuration);
  return linter.getResult();
}

export function assertFailure(ruleName: string, source: string, fail: IExpectedFailure, options = null) {
  let result;
  try {
    result = lint(ruleName, source, options);
  } catch (e) {
    console.log(e.stack);
  }
  chai.assert(result.failureCount > 0, 'no failures');
  result.failures.forEach(ruleFail => {
    chai.assert.equal(fail.message, ruleFail.getFailure(), 'error messages dont\'t match');
    chai.assert.deepEqual(fail.startPosition, ruleFail.getStartPosition().getLineAndCharacter(), 'start char doesn\'t match');
    chai.assert.deepEqual(fail.endPosition, ruleFail.getEndPosition().getLineAndCharacter(),  'end char doesn\'t match');
  });
};

export function assertFailures(ruleName: string, source: string, fails: IExpectedFailure[], options = null) {
    let result;
    try {
        result = lint(ruleName, source, options);
    } catch (e) {
        console.log(e.stack);
    }
    chai.assert(result.failureCount > 0, 'no failures');
    result.failures.forEach((ruleFail,index) => {
            chai.assert.equal(fails[index].message, ruleFail.getFailure(), 'error messages dont\'t match');
            chai.assert.deepEqual(fails[index].startPosition, ruleFail.getStartPosition().getLineAndCharacter(),
              'start char doesn\'t match');
            chai.assert.deepEqual(fails[index].endPosition, ruleFail.getEndPosition().getLineAndCharacter(), 'end char doesn\'t match');
    });
};

export function assertSuccess(ruleName: string, source: string, options = null) {
  chai.assert.equal(lint(ruleName, source, options).failureCount, 0);
};
