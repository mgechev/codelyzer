import { assert } from 'chai';
import { ILinterOptions, IOptions, IRuleMetadata, Linter, LintResult, RuleFailure } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { escapeRegexp } from '../src/util/escapeRegexp';
import { convertRuleOptions, loadRules } from './utils';

interface Failure {
  readonly char: string;
  readonly msg: string;
}

interface SourcePosition {
  readonly character: number;
  readonly line: number;
}

export interface ExpectedFailure {
  readonly endPosition: SourcePosition;
  readonly message: string;
  readonly startPosition: SourcePosition;
}

export interface AssertConfig extends Pick<IRuleMetadata, 'ruleName'> {
  readonly message?: string;
  readonly options?: any;
  readonly source: string;
}

export interface AssertMultipleConfigs extends Pick<AssertConfig, 'options' | 'ruleName' | 'source'> {
  readonly failures: ReadonlyArray<Failure>;
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
const lint = (ruleName: AssertConfig['ruleName'], source: string | SourceFile, ruleArguments: AssertConfig['options'] = []): LintResult => {
  const rulesMap = new Map<string, Partial<IOptions>>([[ruleName, { ruleName, ruleArguments, disabledIntervals: [] }]]);
  const rulesDirectory = './dist/src';
  const configuration = {
    extends: [],
    jsRules: new Map<string, Partial<IOptions>>(),
    rules: rulesMap,
    rulesDirectory: [],
  };
  const linterOptions: ILinterOptions = {
    fix: false,
    formatter: 'json',
    formattersDirectory: undefined,
    rulesDirectory,
  };
  const linter = new Linter(linterOptions, undefined);

  if (typeof source === 'string') {
    linter.lint('file.ts', source, configuration);

    return linter.getResult();
  }

  const rules = loadRules(convertRuleOptions(rulesMap), rulesDirectory, false);
  const failures = rules.reduce<RuleFailure[]>((previousValue, currentValue) => previousValue.concat(currentValue.apply(source)), []);
  const errorCount = failures.filter((r) => !r.getRuleSeverity || r.getRuleSeverity() === 'error').length;
  const fixes = ([] as RuleFailure[]).concat.apply(failures.map((r) => r.getFix()));
  const warningCount = failures.length - errorCount;

  return {
    errorCount,
    failures,
    fixes,
    format: '',
    output: '',
    warningCount,
  };
};

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
const parseInvalidSource = (
  source: AssertConfig['source'],
  message: ExpectedFailure['message'],
  specialChar = '~',
  otherChars: string[] = []
): { failure: ExpectedFailure; source: AssertConfig['source'] } => {
  let replacedSource: string;

  if (otherChars.length === 0) {
    replacedSource = source;
  } else {
    const patternAsStr = `[${otherChars.map(escapeRegexp).join('')}]`;
    const pattern = new RegExp(patternAsStr, 'g');

    replacedSource = source.replace(pattern, ' ');
  }

  let col = 0;
  let line = 0;
  let lastCol = 0;
  let lastLine = 0;
  let startPosition;

  for (const currentChar of replacedSource) {
    if (currentChar === '\n') {
      col = 0;
      line++;

      continue;
    }

    col++;

    if (currentChar !== specialChar) continue;

    if (!startPosition) {
      startPosition = {
        character: col - 1,
        line: line - 1,
      };
    }

    lastCol = col;
    lastLine = line - 1;
  }

  const endPosition: SourcePosition = {
    character: lastCol,
    line: lastLine,
  };
  const newSource = replacedSource.replace(new RegExp(escapeRegexp(specialChar), 'g'), '');

  return {
    failure: {
      endPosition,
      message,
      startPosition,
    },
    source: newSource,
  };
};

/**
 * Helper function used in specs for asserting an annotated failure.
 * See explanation given in `parseInvalidSource` about annotated source code. *
 *
 * @param config
 */
export const assertAnnotated = (config: AssertConfig): RuleFailure[] | void => {
  const { message, options, ruleName, source: sourceConfig } = config;

  if (!message) return assertSuccess(ruleName, sourceConfig, options);

  const { failure, source } = parseInvalidSource(sourceConfig, message);

  return assertFailure(ruleName, source, failure, options);
};

/**
 * Helper function which asserts multiple annotated failures.
 * @param configs
 */
export const assertMultipleAnnotated = (configs: AssertMultipleConfigs): RuleFailure[] => {
  const { failures, options, ruleName, source } = configs;

  return failures.reduce<RuleFailure[]>((previousValue, currentValue, index) => {
    const { msg: currentValueMsg, char: currentValueChar } = currentValue;
    const otherChars = failures.map((failure) => failure.char).filter((char) => char !== currentValueChar);
    const { failure: parsedFailure, source: parsedSource } = parseInvalidSource(source, currentValueMsg, currentValueChar, otherChars);
    const { character: parsedFailureEndChar, line: parsedFailureEndLine } = parsedFailure.endPosition;
    const { character: parsedFailureStartChar, line: parsedFailureStartLine } = parsedFailure.startPosition;

    const newFailures = assertFailure(ruleName, parsedSource, parsedFailure, options, index).filter((ruleFailure) => {
      const { character: ruleFailureEndChar, line: ruleFailureEndLine } = ruleFailure.getEndPosition().getLineAndCharacter();
      const { character: ruleFailureStartChar, line: ruleFailureStartLine } = ruleFailure.getStartPosition().getLineAndCharacter();

      return (
        ruleFailureEndChar === parsedFailureEndChar &&
        ruleFailureEndLine === parsedFailureEndLine &&
        ruleFailureStartChar === parsedFailureStartChar &&
        ruleFailureStartLine === parsedFailureStartLine
      );
    });

    return previousValue.concat(newFailures);
  }, []);
};

const assertFail = (expectedFailure: ExpectedFailure, ruleFailure: RuleFailure): void => {
  assert.equal(expectedFailure.message, ruleFailure.getFailure(), "error messages don't match");
  assert.deepEqual(expectedFailure.startPosition, ruleFailure.getStartPosition().getLineAndCharacter(), "start char doesn't match");
  assert.deepEqual(expectedFailure.endPosition, ruleFailure.getEndPosition().getLineAndCharacter(), "end char doesn't match");
};

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
export const assertFailure = (
  ruleName: AssertConfig['ruleName'],
  source: string | SourceFile,
  expectedFailure: ExpectedFailure,
  options?: AssertConfig['options'],
  onlyNthFailure = 0
): RuleFailure[] => {
  const result = lint(ruleName, source, options);

  assert(result.failures.length > 0, 'no failures');

  const ruleFailure = result.failures[onlyNthFailure];

  assertFail(expectedFailure, ruleFailure);

  return result.failures;
};

/**
 * A helper function used in specs to assert more than one failure.
 * Consider using `assertAnnotated` instead.
 *
 * @param ruleName
 * @param source
 * @param fails
 * @param options
 */
export const assertFailures = (
  ruleName: AssertConfig['ruleName'],
  source: string | SourceFile,
  expectedFailures: ExpectedFailure[],
  options?: AssertConfig['options']
): void => {
  const result = lint(ruleName, source, options);

  assert(result.failures.length > 0, 'no failures');

  result.failures.forEach((ruleFailure, index) => assertFail(expectedFailures[index], ruleFailure));
};

/**
 * A helper function used in specs to assert a success (meaning that there are no lint errors).
 *
 * @param ruleName
 * @param source
 * @param options
 */
export const assertSuccess = (ruleName: AssertConfig['ruleName'], source: string | SourceFile, options?: AssertConfig['options']): void => {
  const result = lint(ruleName, source, options);

  assert.isTrue(result.failures.length === 0);
};
