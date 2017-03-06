import * as tslint from 'tslint';
import * as Lint from 'tslint';
import chai = require('chai');

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

  let linter = new tslint.Linter(linterOptions, undefined);
  linter.lint('file.ts', source, configuration);
  return linter.getResult();
}

export interface AssertConfig {
  ruleName: string;
  source: string;
  options?: any;
  message?: string;
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
 * @returns {{source: string, failure: {message: string, startPosition: null, endPosition: any}}}
 */
const parseInvalidSource = (source: string, message: string) => {
  let start = null;
  let end;
  let line = 0;
  let col = 0;
  let lastCol = 0;
  let lastLine = 0;
  for (let i = 0; i < source.length; i += 1) {
    if (source[i] === '~' && source[i - 1] !== '/' && start === null) {
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
    if (source[i] === '~' && source[i - 1] !== '/') {
      lastCol = col;
      lastLine = line - 1;
    }
  }
  end = {
    line: lastLine,
    character: lastCol
  };
  source = source.replace(/~/g, '');
  return {
    source: source,
    failure: {
      message: message,
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
export function assertAnnotated(config: AssertConfig) {
  if (config.message) {
    const parsed = parseInvalidSource(config.source, config.message);
    assertFailure(config.ruleName, parsed.source, parsed.failure, config.options);
  } else {
    assertSuccess(config.ruleName, config.source, config.options);
  }
};

/**
 * A helper function used in specs to assert a failure (meaning that the code contains a lint error).
 * Consider using `assertAnnotated` instead.
 *
 * @param ruleName
 * @param source
 * @param fail
 * @param options
 * @returns {any}
 */
export function assertFailure(ruleName: string, source: string, fail: IExpectedFailure, options = null): Lint.RuleFailure[] {
  let result: Lint.LintResult;
  try {
    result = lint(ruleName, source, options);
  } catch (e) {
    console.log(e.stack);
  }
  chai.assert(result.failureCount > 0, 'no failures');
  result.failures.forEach((ruleFail: tslint.RuleFailure) => {
    chai.assert.equal(fail.message, ruleFail.getFailure(), `error messages don't match`);
    chai.assert.deepEqual(fail.startPosition, ruleFail.getStartPosition().getLineAndCharacter(), `start char doesn't match`);
    chai.assert.deepEqual(fail.endPosition, ruleFail.getEndPosition().getLineAndCharacter(), `end char doesn't match`);
  });
  if (result) {
    return result.failures;
  }
  return undefined;
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
export function assertFailures(ruleName: string, source: string, fails: IExpectedFailure[], options = null) {
  let result;
  try {
    result = lint(ruleName, source, options);
  } catch (e) {
    console.log(e.stack);
  }
  chai.assert(result.failureCount > 0, 'no failures');
  result.failures.forEach((ruleFail, index) => {
    chai.assert.equal(fails[index].message, ruleFail.getFailure(), `error messages don't match`);
    chai.assert.deepEqual(fails[index].startPosition, ruleFail.getStartPosition().getLineAndCharacter(), `start char doesn't match`);
    chai.assert.deepEqual(fails[index].endPosition, ruleFail.getEndPosition().getLineAndCharacter(), `end char doesn't match`);
  });
};

/**
 * A helper function used in specs to assert a success (meaning that there are no lint errors).
 *
 * @param ruleName
 * @param source
 * @param options
 */
export function assertSuccess(ruleName: string, source: string, options = null) {
  chai.assert.equal(lint(ruleName, source, options).failureCount, 0);
};
