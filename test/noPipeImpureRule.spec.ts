import { Rule } from '../src/noPipeImpureRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
  FAILURE_STRING
} = Rule;

describe(ruleName, () => {
  describe('failures', () => {
    it('should fail if pure property is set to false', () => {
      const source = `
        @Pipe({
          name: 'test',
          pure: false
          ~~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source
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
  describe('A class without name', () => {
    it('should not broke the linter', () => {
      let source = 'export default class {}';
      assertSuccess(ruleName, source);
    });
  });
});
