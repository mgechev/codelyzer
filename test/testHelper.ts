import * as ts from 'typescript';
import * as tslint from 'tslint';
import * as Lint from 'tslint';
import chai = require('chai');
import * as rimraf from 'rimraf';
import {dirname, join} from 'path';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';

export type File = string;
export type Path = string;
export type Project = {[key: string]: string};

// const proxyInMemoryHost = (host: ts.CompilerHost, project: Project): ts.CompilerHost => {
//   return new Proxy(host, {
//     get(target: ts.CompilerHost, propKey: string, receiver: any) {
//       var original = target[propKey];
//       if (typeof original === 'function') {
//         original = original.bind(target);
//         if (propKey === 'fileExists') {
//           return function (filename: string) {
//             return !!project[filename] || original(filename);
//           };
//         } else if (propKey === 'getSourceFile') {
//           return function (filename: string, version: ts.ScriptTarget) {
//             // if (project[filename]) {
//             //   return ts.createSourceFile(filename, project[filename], version);
//             // }
//             return original(filename, version);
//           };
//         } else {
//           return original;
//         }
//       } else {
//         return original;
//       }
//     }
//   });
// };

export const normalizeOptions = (options: any, configFilePath: string) => {
  options.genDir = options.basePath = options.baseUrl;
  options.configFilePath = configFilePath;
};

export const createProgramFromTsConfig = (configFile: string): ts.Program => {
  const projectDirectory = dirname(configFile);
  const { config } = ts.readConfigFile(configFile, ts.sys.readFile);

  // Any because of different APIs in TypeScript 2.1 and 2.0
  const parseConfigHost: any = {
    fileExists: existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: (file) => readFileSync(file, 'utf8'),
    useCaseSensitiveFileNames: true,
  };
  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, projectDirectory);
  parsed.options.baseUrl = parsed.options.baseUrl || projectDirectory;
  normalizeOptions(parsed.options, configFile);
  const host = ts.createCompilerHost(parsed.options, true);
  const program = ts.createProgram(parsed.fileNames, parsed.options, host);

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

const cleanMockEnvironment = (dir: string) => {
  rimraf.sync(dir);
};

const createMockEnvironment = (content: string) => {
  const dir = join(__dirname, '..', 'fixture');
  mkdirSync(dir);
  writeFileSync(join(dir, 'file.ts'), content);
  writeFileSync(join(dir, 'tsconfig.json'), `
    {
      "compilerOptions": {
        "target": "es5",
        "module": "commonjs",
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "moduleResolution": "node"
      },
      "files": [
        "file.ts"
      ]
    }
  `);
  return dir;
};

function lint(ruleName: string, source: string, options: any): tslint.LintResult {
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
  const dir = createMockEnvironment(source);
  let linter: tslint.Linter = new tslint.Linter(linterOptions, createProgramFromTsConfig(join(dir, 'tsconfig.json')));
  linter.lint(join(dir, 'file.ts'), source, configuration);
  const result = linter.getResult();
  cleanMockEnvironment(dir);
  return result;
}

export interface AssertConfig {
  ruleName: string;
  source: string;
  options?: any;
  message?: string;
}

const parseInvalidSource = (source: string, message: string) => {
  let start = null;
  let end = null;
  let ended = false;
  let line = 0;
  let col = 0;
  let linearStart = 0;
  let linearEnd = 0;
  for (let i = 0; i < source.length && !ended; i += 1) {
    if (source[i] === '~' && source[i - 1] !== '/' && start === null) {
      start = {
        line: line - 1,
        character: col
      };
      linearStart = i;
    } else if (start !== null && source[i] !== '~') {
      end = {
        line: line - 1,
        character: col
      };
      linearEnd = i;
      ended = true;
    }
    if (source[i] === '\n') {
      col = 0;
      line += 1;
    } else {
      col += 1;
    }
  }
  let whitespace = '';
  for (let i = start; i < end; i += 1) {
    whitespace += ' ';
  }
  source = source.substring(0, linearStart) + whitespace + source.substring(linearEnd, source.length);
  console.log(source.substring(0, linearStart));
  return {
    source: source,
    failure: {
      message: message,
      startPosition: start,
      endPosition: end
    }
  };
};

export function assertAnnotated(config: AssertConfig) {
  if (config.message) {
    const parsed = parseInvalidSource(config.source, config.message);
    assertFailure(config.ruleName, parsed.source, parsed.failure, config.options);
  } else {
    assertSuccess(config.ruleName, config.source, config.options);
  }
};

export function assertFailure(ruleName: string, source: string, fail: IExpectedFailure, options = null): Lint.RuleFailure[] {
  let result: Lint.LintResult;
  try {
    result = lint(ruleName, source, options);
  } catch (e) {
    console.log(e.stack);
  }
  chai.assert(result.failureCount > 0, 'no failures');
  result.failures.forEach((ruleFail: tslint.RuleFailure) => {
    chai.assert.equal(fail.message, ruleFail.getFailure(), 'error messages dont\'t match');
    chai.assert.deepEqual(fail.startPosition, ruleFail.getStartPosition().getLineAndCharacter(), 'start char doesn\'t match');
    chai.assert.deepEqual(fail.endPosition, ruleFail.getEndPosition().getLineAndCharacter(),  'end char doesn\'t match');
  });
  if (result) {
    return result.failures;
  }
  return undefined;
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
