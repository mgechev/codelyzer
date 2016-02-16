import {assertFailure, assertSuccess} from './testHelper';

describe('directive-selector-name', () => {
  describe('invalid directive selectors', () => {
    it('should fail when directive named kebab-case', () => {
      let source = `
      @Directive({
        selector: 'foo-bar'
      })
      class Test {}`;
      assertFailure('directive-selector-name', source, {
        message: 'The selector of the directive "Test" should be named camelCase, however its value is "foo-bar".',
        startPosition: {
          line: 2,
          character: 18
        },
        endPosition: {
          line: 2,
          character: 27
        }
      }, 'camelCase');
    });
  });
  describe('valid directive selector', () => {
    it('should succeed when set valid selector in @Directive', () => {
      let source = `
      @Component({
        selector: 'sgBarFoo'
      })
      class Test {}`;
      assertSuccess('component-selector-name', source, 'camelCase');
    });
  });
});
