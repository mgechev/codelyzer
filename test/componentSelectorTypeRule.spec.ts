import {assertFailure, assertSuccess} from './testHelper';

describe('component-selector-type', () => {
  describe('invalid component selectors', () => {
    it('should fail when component used as attribute', () => {
      let source = `
      @Component({
        selector: '[fooBar]'
      })
      class Test {}`;
      assertFailure('component-selector-type', source, {
        message: 'The selector of the component "Test" should be used as element, however its value is "[fooBar]".',
        startPosition: {
          line: 2,
          character: 18
        },
        endPosition: {
          line: 2,
          character: 28
        }
      }, 'element');
    });
  });
  describe('valid component selector', () => {
    it('should succeed when set valid selector in @Component', () => {
      let source = `
      @Component({
        selector: 'sg-bar-foo'
      })
      class Test {}`;
      assertSuccess('component-selector-type', source, 'element');
    });
  });
});
