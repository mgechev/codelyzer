import {assertFailure, assertSuccess} from './testHelper';

describe('component-selector-name', () => {
  describe('invalid component selectors', () => {
    it('should fail when component named camelCase', () => {
      let source = `
      @Component({
        selector: 'fooBar'
      })
      class Test {}`;
      assertFailure('component-selector-name', source, {
        message: 'The selector of the component "Test" should be named kebab-case, however its value is "fooBar".',
        startPosition: {
          line: 2,
          character: 18
        },
        endPosition: {
          line: 2,
          character: 26
        }
      }, 'kebab-case');
    });
  });
  describe('valid component selector', () => {
    it('should succeed when set valid selector in @Component', () => {
      let source = `
      @Component({
        selector: 'sg-bar-foo'
      })
      class Test {}`;
      assertSuccess('component-selector-name', source, 'kebab-case');
    });
  });
});
