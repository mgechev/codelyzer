import { assert } from 'chai';
import { ILinterOptions, IOptions, Linter, LintResult, RuleFailure } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { loadRules, convertRuleOptions } from './utils';

interface ISourcePosition {
  line: number;
  character: number;
}

export interface IExpectedFailure {
  message: string;
  startPosition: ISourcePosition;
  endPosition: ISourcePosition;
}

/**
 * A helper function for specs. Lints the given `source` string against the `ruleName` with
 *  `options`.
 *
 *  You're unlikely to use these in actual specs. Usually you'd use some of the following:
 *    - `assertAnnotated` or
 *    - `assertSuccess`.
 *
 * @param ruleName the name of the rule which is being tested
 * @param source the source code, as a string
 * @param options additional options for the lint rule
 * @returns {LintResult} the result of linting
 */
function lint(ruleName: string, source: string | SourceFile, options: any): LintResult {
  let configuration = {
    extends: [],
    rules: new Map<string, Partial<IOptions>>(),
    jsRules: new Map<string, Partial<IOptions>>(),
    rulesDirectory: []
  };
  if (!options) {
    options = [];
  }
  const ops: Partial<IOptions> = { ruleName, ruleArguments: options, disabledIntervals: [] };
  configuration.rules.set(ruleName, ops);
  const linterOptions: ILinterOptions = {
    formatter: 'json',
    rulesDirectory: './dist/src',
    formattersDirectory: undefined,
    fix: false
  };

  let linter = new Linter(linterOptions, undefined);
  if (typeof source === 'string') {
    linter.lint('file.ts', source, configuration);
  } else {
    const rules = loadRules(convertRuleOptions(configuration.rules), linterOptions.rulesDirectory, false);
    const res = [].concat.apply([], rules.map(r => r.apply(source))) as RuleFailure[];
    const errCount = res.filter(r => !r.getRuleSeverity || r.getRuleSeverity() === 'error').length;

    return {
      errorCount: errCount,
      warningCount: res.length - errCount,
      output: '',
      format: '',
      fixes: [].concat.apply(res.map(r => r.getFix())),
      failures: res
    };
  }

  return linter.getResult();
}

export interface AssertConfig {
  ruleName: string;
  source: string;
  options?: any;
  message?: string;
}

export interface AssertMultipleConfigs {
  ruleName: string;
  source: string;
  options?: any;
  failures: { char: string; msg: string }[];
}

/**
 * When testing a failure, we also test to see if the linter will report the correct place where
 * the source code doesn't match the rule.
 *
 * For example, if you use a private property in your template, the linter should report _where_
 * did it happen. Because it's tedious to supply actual line/column number in the spec, we use
 * some custom syntax with "underlining" the problematic part with tildes:
 *
 * ```
 * template: '{{ foo }}'
 *               ~~~
 * ```
 *
 * When giving a spec which we expect to fail, we give it "source code" such as above, with tildes.
 * We call this kind of source code "annotated". This source code cannot be compiled (and thus
 * cannot be linted/tested), so we use this function to get rid of tildes, but maintain the
 * information about where the linter is supposed to catch error.
 *
 * The result of the function contains "cleaned" source (`.source`) and a `.failure` object which
 * contains the `.startPosition` and `.endPosition` of the tildes.
 *
 * @param source The annotated source code with tildes.
 * @param message Passed to the result's `.failure.message` property.
 * @param specialChar The character to look for; in the above example that's ~.
 * @param otherChars All other characters which should be ignored. Used when asserting multiple
 *                   failures where there are multiple invalid characters.
 * @returns {{source: string, failure: {message: string, startPosition: null, endPosition: any}}}
 */
const parseInvalidSource = (source: string, message: string, specialChar = '~', otherChars: string[] = []) => {
  otherChars.forEach(char => source.replace(new RegExp(char, 'g'), ' '));

  let start;
  let end;
  let line = 0;
  let col = 0;
  let lastCol = 0;
  let lastLine = 0;

  for (let i = 0; i < source.length; i += 1) {
    if (source[i] === specialChar && source[i - 1] !== '/' && start === undefined) {
      start = {
        line: line - 1,
        character: col
      };
    }

    if (source[i] === '\n') {
      col = 0;
      line += 1;
    } else {
      col += 1;
    }

    if (source[i] === specialChar && source[i - 1] !== '/') {
      lastCol = col;
      lastLine = line - 1;
    }
  }

  end = {
    line: lastLine,
    character: lastCol
  };

  source = source.replace(new RegExp(specialChar, 'g'), '');

  return {
    source,
    failure: {
      message,
      startPosition: start,
      endPosition: end
    }
  };
};

/**
 * Helper function used in specs for asserting an annotated failure.
 * See explanation given in `parseInvalidSource` about annotated source code. *
 *
 * @param config
 */
export function assertAnnotated(config: AssertConfig): RuleFailure[] | void {
  const { message, options, ruleName, source: sourceConfig } = config;

  if (message) {
    const { failure, source } = parseInvalidSource(sourceConfig, message);

    return assertFailure(ruleName, source, failure, options);
  }

  return assertSuccess(ruleName, sourceConfig, options);
}

/**
 * Helper function which asserts multiple annotated failures.
 * @param configs
 */
export function assertMultipleAnnotated(configs: AssertMultipleConfigs): RuleFailure[] {
  const { failures, options, ruleName, source } = configs;

  return [].concat.apply(
    [],
    failures
      .map((failure, index) => {
        const otherCharacters = failures.map(message => message.char).filter(x => x !== failure.char);

        if (!failure.msg) {
          assertSuccess(ruleName, source, options);

          return null;
        }

        const { failure: parsedFailure, source: parsedSource } = parseInvalidSource(source, failure.msg, failure.char, otherCharacters);

        return (assertFailure(ruleName, parsedSource, parsedFailure, options, index) || []).filter(f => {
          const { character: startChar, line: startLine } = f.getStartPosition().getLineAndCharacter();
          const { character: endChar, line: endLine } = f.getEndPosition().getLineAndCharacter();

          return (
            startChar === parsedFailure.startPosition.character &&
            startLine === parsedFailure.endPosition.line &&
            endChar === parsedFailure.endPosition.character &&
            endLine === parsedFailure.endPosition.line
          );
        });
      })
      .filter(r => r !== null)
  );
}

/**
 * A helper function used in specs to assert a failure (meaning that the code contains a lint error).
 * Consider using `assertAnnotated` instead.
 *
 * @param ruleName
 * @param source
 * @param fail
 * @param options
 * @param onlyNthFailure When there are multiple failures in code, we might want to test only some.
 *                       This is 0-based index of the error that will be tested for. 0 by default.
 * @returns {any}
 */
export function assertFailure(
  ruleName: string,
  source: string | SourceFile,
  fail: IExpectedFailure,
  options?: any,
  onlyNthFailure = 0
): RuleFailure[] {
  const result = lint(ruleName, source, options);

  assert(result.failures && result.failures.length > 0, 'no failures');

  const ruleFail = result.failures[onlyNthFailure];

  assert.equal(fail.message, ruleFail.getFailure(), "error messages don't match");
  assert.deepEqual(fail.startPosition, ruleFail.getStartPosition().getLineAndCharacter(), "start char doesn't match");
  assert.deepEqual(fail.endPosition, ruleFail.getEndPosition().getLineAndCharacter(), "end char doesn't match");

  return result.failures;
}

/**
 * A helper function used in specs to assert more than one failure.
 * Consider using `assertAnnotated` instead.
 *
 * @param ruleName
 * @param source
 * @param fails
 * @param options
 */
export function assertFailures(ruleName: string, source: string | SourceFile, fails: IExpectedFailure[], options?: any) {
  const result = lint(ruleName, source, options);

  assert(result.failures && result.failures.length > 0, 'no failures');
  result.failures.forEach((ruleFail, index) => {
    assert.equal(fails[index].message, ruleFail.getFailure(), "error messages don't match");
    assert.deepEqual(fails[index].startPosition, ruleFail.getStartPosition().getLineAndCharacter(), "start char doesn't match");
    assert.deepEqual(fails[index].endPosition, ruleFail.getEndPosition().getLineAndCharacter(), "end char doesn't match");
  });
}

/**
 * A helper function used in specs to assert a success (meaning that there are no lint errors).
 *
 * @param ruleName
 * @param source
 * @param options
 */
export function assertSuccess(ruleName: string, source: string | SourceFile, options?: any) {
  const result = lint(ruleName, source, options);
  assert.isTrue(result && result.failures.length === 0);
}
