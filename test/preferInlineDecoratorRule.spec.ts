import { expect } from 'chai';
import { Replacement } from 'tslint/lib';
import { decoratorKeys, getFailureMessage, Rule } from '../src/preferInlineDecoratorRule';
import { assertFailure, assertFailures, assertSuccess, IExpectedFailure } from './testHelper';

const {
  metadata: { ruleName }
} = Rule;
const className = 'Test';

describe(ruleName, () => {
  describe('failure', () => {
    const expectedFailure: IExpectedFailure = {
      endPosition: {
        character: 35,
        line: 3
      },
      message: getFailureMessage(),
      startPosition: {
        character: 14,
        line: 2
      }
    };

    decoratorKeys.forEach(decoratorKey => {
      describe(decoratorKey, () => {
        it('should fail when a property does not start on the same line as the decoratorKey', () => {
          const source = `
            class ${className} {
              @${decoratorKey}('childTest')
              childTest: ChildTest;
            }
          `;
          assertFailure(ruleName, source, expectedFailure);
        });

        it('should fail and apply proper replacements when a property does not start on the same line as the decoratorKey', () => {
          const source = `
            class ${className} {
              @${decoratorKey}('childTest')
              childTest: ChildTest;
            }
          `;
          const failures = assertFailure(ruleName, source, expectedFailure)!;
          const replacement = Replacement.applyFixes(source, failures.map(f => f.getFix()!));

          expect(replacement).to.eq(`
            class ${className} {
              @${decoratorKey}('childTest') childTest: ChildTest;
            }
          `);
        });
      });
    });

    describe('blacklist', () => {
      it('should fail when a property does not start on the same line as the decoratorKey and is not present on blacklist options', () => {
        const [firstDecorator, ...restDecorators] = Array.from(decoratorKeys);
        const source = `
          class ${className} {
            @${firstDecorator}()
            test = new EventEmitter<void>();
          }
        `;
        assertFailure(
          ruleName,
          source,
          {
            endPosition: {
              character: 44,
              line: 3
            },
            message: getFailureMessage(),
            startPosition: {
              character: 12,
              line: 2
            }
          },
          restDecorators
        );
      });
    });

    it('should fail when there are multiple properties that does not start on the same line as the decoratorKey', () => {
      const source = `
        class ${className} {
          @Input('childTest')
          childTest: ChildTest;
          @Input('foo')
          foo: Foo;
        }
      `;
      assertFailures(ruleName, source, [
        {
          endPosition: {
            character: 31,
            line: 3
          },
          message: getFailureMessage(),
          startPosition: {
            character: 10,
            line: 2
          }
        },
        {
          endPosition: {
            character: 19,
            line: 5
          },
          message: getFailureMessage(),
          startPosition: {
            character: 10,
            line: 4
          }
        }
      ]);
    });
  });

  describe('success', () => {
    decoratorKeys.forEach(decoratorKey => {
      describe(decoratorKey, () => {
        it('should succeed when a property starts and ends on the same line as the decoratorKey', () => {
          const source = `
            class ${className} {
              @${decoratorKey}('childTest') childTest123: ChildTest;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed when a property starts on the same line as the decoratorKey and ends on another line', () => {
          const source = `
            class ${className} {
              @${decoratorKey}('childTest') childTest123: ChildTest =
                veryVeryVeryVeryVeryVeryVeryLongDefaultVariable;
            }
          `;
          assertSuccess(ruleName, source);
        });
      });
    });

    describe('blacklist', () => {
      it('should succeed when a property starts on another line and is present on blacklist options', () => {
        const [firstDecorator] = Array.from(decoratorKeys);
        const source = `
          class ${className} {
            @${firstDecorator}()
            test = new EventEmitter<void>();
          }
        `;
        assertSuccess(ruleName, source, [firstDecorator]);
      });
    });

    describe('special cases', () => {
      it('should succeed when getters starts on the same line as the decoratorKey and ends on another line', () => {
        const source = `
          class ${className} {
            @Input() get test(): string {
              return this._test;
            }
            private _test: string;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed when setters starts on the same line as the decoratorKey and ends on another line', () => {
        const source = `
          class ${className} {
            @Input() set test(value: string) {
              this._test = value;
            }
            private _test: string;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed for getters and setters on another line', () => {
        const source = `
          class ${className} {
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
});
