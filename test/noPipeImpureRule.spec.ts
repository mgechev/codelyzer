import { getFailureMessage, Rule } from '../src/noPipeImpureRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failures', () => {
    it('should fail if pure property is set to false', () => {
      const source = `
        @Pipe({
          name: 'test',
          pure: false
                ~~~~~
        })
        class Test {}
      `;
      const message = getFailureMessage({
        className: 'Test',
      });
      assertAnnotated({
        message,
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed if pure property is set to true', () => {
      const source = `
        @Pipe({
          name: 'test',
          pure: true
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if pure property is not set', () => {
      const source = `
        @Pipe({
          name: 'test'
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
