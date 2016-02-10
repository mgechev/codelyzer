import * as Lint from 'tslint';
import * as tslint from 'tslint/lib/lint';
import chai = require('chai');

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

export function assertFailure(ruleName: string, source: string, fail: string[], options = null) {
  lint(ruleName, source, options).failures.forEach((ruleFail) => {
    console.log(ruleFail.getFailure());
    chai.assert(fail.indexOf(ruleFail.getFailure()) >= 0);
  });
};

export function assertSuccess(ruleName: string, source: string, options = null) {
  chai.assert.equal(lint(ruleName, source, options).failureCount, 0);
};
