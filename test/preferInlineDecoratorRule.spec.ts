import { expect } from 'chai';
import { Replacement } from 'tslint/lib';
import { Rule } from '../src/preferInlineDecoratorRule';
import { Decorators } from '../src/util/utils';
import { assertAnnotated, assertFailures, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    describe('common cases', () => {
      it('should fail if a property is not on the same line as its decorator', () => {
        const source = `
          class Test {
            @Input('test')
            ~~~~~~~~~~~~~~
            testVar: string;
            ~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should fail if multiple properties are not on the same line as their decorators', () => {
        const source = `
          class Test {
            @Input('test1')
            testVar1: string;
            @Input('test2')
            testVar2: string;
          }
        `;
        assertFailures(ruleName, source, [
          {
            endPosition: {
              character: 29,
              line: 3
            },
            message: FAILURE_STRING,
            startPosition: {
              character: 12,
              line: 2
            }
          },
          {
            endPosition: {
              character: 29,
              line: 5
            },
            message: FAILURE_STRING,
            startPosition: {
              character: 12,
              line: 4
            }
          }
        ]);
      });
    });

    describe('blacklist', () => {
      it('should fail if a property is not on the same line as its decorator, which is not blacklisted', () => {
        const source = `
          class Test {
            @Input('test')
            ~~~~~~~~~~~~~~
            testVar: string;
            ~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [Decorators.Output],
          ruleName,
          source
        });
      });
    });
  });

  describe('success', () => {
    describe('common cases', () => {
      it('should succeed if a property is on the same line as its decorator', () => {
        const source = `
          class Test {
            @Input('test') testVar: string;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if multiple properties are on the same line as their decorators', () => {
        const source = `
          class Test {
            @Input('test1') testVar1: string;
            @Input('test2') testVar2: string;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property starts on the same line as its decorator and ends on the next line', () => {
        const source = `
          class Test {
            @Input('test') testVar: string =
              veryVeryVeryVeryVeryVeryVeryLongDefaultVariable;
          }
        `;
        assertSuccess(ruleName, source);
      });
    });

    describe('blacklist', () => {
      it('should succeed if a property is not on the same line as its decorator, which is blacklisted', () => {
        const source = `
          class Test {
            @Output()
            test = new EventEmitter<void>();
          }
        `;
        assertSuccess(ruleName, source, [Decorators.Output]);
      });
    });

    describe('special cases', () => {
      it('should succeed if getter accessor starts on the same line as its decorator and ends on the next line', () => {
        const source = `
          class Test {
            @Input() get test(): string {
              return this._test;
            }
            private _test: string;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if setter accessor starts on the same line as its decorator and ends on the next line', () => {
        const source = `
          class Test {
            @Input() set test(value: string) {
              this._test = value;
            }
            private _test: string;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if getters/setters accessors are not on the same line as their decorators', () => {
        const source = `
          class Test {
            @Input()
            get test(): string {
              return this._test;
            }
            set test(value: string) {
              this._test = value;
            }
            private _test: string;
          }
        `;
        assertSuccess(ruleName, source);
      });
    });
  });

  describe('replacements', () => {
    it('should fail if a property is not on the same line as its decorator', () => {
      const source = `
        class Test {
          @Output()
          ~~~~~~~~~
          test = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      const failures = assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source
      });

      if (!Array.isArray(failures)) return;

      const replacement = Replacement.applyFixes(source, failures.map(x => x.getFix()!));

      expect(replacement).to.eq(`
        class Test {
          @Output()          test = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `);
    });
  });
});
