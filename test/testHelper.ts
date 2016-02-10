import * as Lint from 'tslint';
import * as tslint from 'tslint/lib/lint';
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
    configuration: configuration,
    rulesDirectory: './dist/src',
    formattersDirectory: null
  };
  let linter = new Lint('file.ts', source, linterOptions);
  return linter.lint();
}

export function assertFailure(ruleName: string, source: string, fail: IExpectedFailure, options = null) {
  let result = lint(ruleName, source, options);
  chai.assert(result.failureCount > 0);
  result.failures.forEach((ruleFail) => {
    chai.assert(fail.message === ruleFail.getFailure());
    chai.assert.deepEqual(fail.startPosition, ruleFail.getStartPosition().getLineAndCharacter());
    chai.assert.deepEqual(fail.endPosition, ruleFail.getEndPosition().getLineAndCharacter());
  });
};

export function assertSuccess(ruleName: string, source: string, options = null) {
  chai.assert.equal(lint(ruleName, source, options).failureCount, 0);
};
