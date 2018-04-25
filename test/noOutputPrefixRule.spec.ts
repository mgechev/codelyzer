import { sprintf } from 'sprintf-js';
import { Rule } from '../src/noOutputPrefixRule';
import { assertAnnotated, assertFailures, assertMultipleAnnotated, assertSuccess } from './testHelper';

type MetadataType = 'Component' | 'Directive';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;
const metadatas = new Set<MetadataType>(['Component', 'Directive']);

const getErrorMessage = (propertyName: string, strPattern: string): string => {
  return sprintf.apply(this, [FAILURE_STRING, propertyName, strPattern]);
};

const getFailureAnnotation = (num: number): string => {
  return '~'.repeat(num);
};

const getOutputExpression = (propertyName: string): string => {
  return `@Output() ${propertyName} = new EventEmitter<void>();`;
};

describe(ruleName, () => {
  metadatas.forEach(metadata => {
    describe(metadata, () => {
      describe('failure', () => {
        it('should fail when an output property is prefixed by a not allowed prefix', () => {
          const options: [boolean, string] = [true, '^on'];
          const propertyName = 'onChange';
          const outputExpression = getOutputExpression(propertyName);
          const source = `
            @${metadata}()
            class ${metadata} {
              ${outputExpression}
              ${getFailureAnnotation(outputExpression.length)}
            }
          `;
          assertAnnotated({
            message: getErrorMessage(propertyName, options[1]),
            options,
            ruleName,
            source
          });
        });

        it('should fail when an output property is strictly equal a not allowed prefix', () => {
          const options: [boolean, string] = [true, '^(event|yes)'];
          const propertyName = 'event';
          const outputExpression = getOutputExpression(propertyName);
          const source = `
            @${metadata}()
            class ${metadata} {
              ${outputExpression}
              ${getFailureAnnotation(outputExpression.length)}
            }
          `;
          assertAnnotated({
            message: getErrorMessage(propertyName, options[1]),
            options,
            ruleName,
            source
          });
        });

        it('should fail when multiple output properties matches the blacklist pattern', () => {
          const options: [boolean, string] = [true, '^(ok|should)'];
          const propertyName1 = 'shouldTest';
          const propertyName2 = 'okTest';
          const source = `
            @${metadata}()
            class ${metadata} {
              ${getOutputExpression(propertyName1)}
              ${getOutputExpression(propertyName2)}
            }
          `;
          assertFailures(
            ruleName,
            source,
            [
              {
                endPosition: {
                  character: 62,
                  line: 3
                },
                message: getErrorMessage(propertyName1, options[1]),
                startPosition: {
                  character: 14,
                  line: 3
                }
              },
              {
                endPosition: {
                  character: 58,
                  line: 4
                },
                message: getErrorMessage(propertyName2, options[1]),
                startPosition: {
                  character: 14,
                  line: 4
                }
              }
            ],
            options
          );
        });
      });

      describe('success', () => {
        it('should succeed when there is no output property', () => {
          const source = `
            @${metadata}()
            class ${metadata} {}
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed when the output property does not match the blacklist pattern', () => {
          const options: [boolean, string] = [true, '^(ok|should)[A-Z]+'];
          const source = `
            @${metadata}()
            class ${metadata} {
              ${getOutputExpression('okay')}
            }
          `;
          assertSuccess(ruleName, source, options);
        });

        it('should succeed when multiple output properties does not match the blacklist pattern', () => {
          const options: [boolean, string] = [true, '^(hey|zzzz)'];
          const source = `
            @${metadata}()
            class ${metadata} {
              ${getOutputExpression('heTest')}
              ${getOutputExpression('zzzChange')}
            }
          `;
          assertSuccess(ruleName, source, options);
        });
      });
    });
  });
});
