import {assertFailure, assertSuccess} from './testHelper';

describe('directive-selector-type', () => {
  describe('invalid directive selectors', () => {
    it('should fail when directive used as attribute', () => {
      let source = `
      @Directive({
        selector: 'foo-bar'
      })
      class Test {}`;
      assertFailure('directive-selector-type', source, {
        message: 'The selector of the directive "Test" should be used as attribute, however its value is "foo-bar".',
        startPosition: {
          line: 2,
          character: 18
        },
        endPosition: {
          line: 2,
          character: 27
        }
      }, 'attribute');
    });
  });
  describe('valid directive selector', () => {
    it('should succeed when set valid selector in @Directive', () => {
      let source = `
      @Directive({
        selector: '[sgBarFoo]'
      })
      class Test {}`;
      assertSuccess('directive-selector-type', source, 'attribute');
    });
  });
});
