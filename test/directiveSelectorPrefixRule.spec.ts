import {assertFailure, assertSuccess} from './testHelper';

describe('directive-selector-prefix', () => {
  describe('invalid directive selectors', () => {
    it('should fail when directive used without prefix', () => {
      let source = `
      @Directive({
        selector: 'foo-bar'
      })
      class Test {}`;
      assertFailure('directive-selector-prefix', source, {
        message: 'The selector of the directive "Test" should have prefix "sg", however its value is "foo-bar".',
        startPosition: {
          line: 2,
          character: 18
        },
        endPosition: {
          line: 2,
          character: 27
        }
      }, 'sg');
    });
  });
  describe('valid directive selector', () => {
    it('should succeed when set valid selector in @Directive', () => {
      let source = `
      @Directive({
        selector: 'sgBarFoo'
      })
      class Test {}`;
      assertSuccess('directive-selector-prefix', source, 'sg');
    });
  });
});
