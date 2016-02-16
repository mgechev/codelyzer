import {assertFailure, assertSuccess} from './testHelper';

describe('directive-selector-type', () => {
  describe('invalid component selectors', () => {
    it('should fail when component used as attribute', () => {
      let source = `
      @Component({
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
  describe('valid component selector', () => {
    it('should succeed when set valid selector in @Component', () => {
      let source = `
      @Component({
        selector: '[sgBarFoo]'
      })
      class Test {}`;
      assertSuccess('directive-selector-type', source, 'attribute');
    });
  });
});
