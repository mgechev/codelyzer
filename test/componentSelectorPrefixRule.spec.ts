import {assertFailure, assertSuccess} from './testHelper';

describe('component-selector-prefix', () => {
  describe('invalid component selectors', () => {
    it('should fail when component used without prefix', () => {
      let source = `
      @Component({
        selector: 'foo-bar'
      })
      class Test {}`;
      assertFailure('component-selector-prefix', source, {
        message: 'The selector of the component "Test" should have prefix "sg", however its value is "foo-bar".',
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
  describe('valid component selector', () => {
    it('should succeed when set valid selector in @Component', () => {
      let source = `
      @Component({
        selector: 'sg-bar-foo'
      })
      class Test {}`;
      assertSuccess('component-selector-prefix', source, 'sg');
    });
  });
});
