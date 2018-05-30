import * as ts from 'typescript';

import * as Linter from 'tslint';
import { LintResult } from 'tslint';

export function getSourceFile(fileName: string, source: string): ts.SourceFile | undefined {
  const normalizedName = fileName;
  const compilerOptions = createCompilerOptions();

  const compilerHost: ts.CompilerHost = {
    fileExists: () => true,
    getCanonicalFileName: (filename: string) => filename,
    getCurrentDirectory: () => '',
    getDefaultLibFileName: () => 'lib.d.ts',
    getDirectories: (_path: string) => [],
    getNewLine: () => '\n',
    getSourceFile: (filenameToGet: string) => {
      return filenameToGet === normalizedName ? ts.createSourceFile(filenameToGet, source, compilerOptions.target!, true) : undefined;
    },
    readFile: () => undefined,
    useCaseSensitiveFileNames: () => true,
    writeFile: () => undefined
  };

  const program = ts.createProgram([normalizedName], compilerOptions, compilerHost);
  return program.getSourceFile(normalizedName);
}

export function createCompilerOptions(): ts.CompilerOptions {
  return {
    noResolve: true,
    target: ts.ScriptTarget.ES5
  };
}

export class WebLinter {
  private failures: Linter.RuleFailure[] = [];

  public lint(fileName: string, source: string, enabledRules: any): void {
    let sourceFile = getSourceFile(fileName, source);

    if (sourceFile === undefined) {
      throw new Error(`Invalid source file: ${fileName}. Ensure that the files supplied to lint have a .ts or .tsx extension.`);
    }

    for (let rule of enabledRules) {
      let ruleFailures: Linter.RuleFailure[] = [];
      ruleFailures = rule.apply(sourceFile);
      for (let ruleFailure of ruleFailures) {
        if (!this.containsRule(this.failures, ruleFailure)) {
          this.failures.push(ruleFailure);
        }
      }
    }
  }

  public getResult(): LintResult {
    const formatter = new Linter.Formatters.JsonFormatter();
    const output = formatter.format(this.failures);

    return {
      warningCount: 0,
      errorCount: this.failures.length,
      failures: this.failures,
      format: 'json',
      output
    };
  }

  public reset() {
    this.failures.length = 0;
  }

  private containsRule(rules: Linter.RuleFailure[], rule: Linter.RuleFailure) {
    return rules.some(r => r.equals(rule));
  }
}
