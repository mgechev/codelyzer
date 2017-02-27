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
  //console.log(source.substring(0, linearStart));
  console.log(start);
  console.log(end);
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
