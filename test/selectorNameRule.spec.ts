import {assertFailure, assertSuccess} from './testHelper';

describe('component-selector', () => {
  describe('invalid component selectors', () => {
    it('should fail when component used as attribute', () => {
      let source = `
      @Component({
        selector: '[foo]'
      })
      class Test {}`;
      assertFailure('component-selector', source, {
        message: 'Invalid selector "[foo]" for component "Test".',
        startPosition: {
          line: 2,
          character: 18
        },
        endPosition: {
          line: 2,
          character: 25
        }
      }, ['element', 'kebab-case']);
    });
    it('should fail when component named camelCase', () => {
      let source = `
      @Component({
        selector: 'fooBar'
      })
      class Test {}`;
      assertFailure('component-selector', source, {
        message: 'Invalid selector "fooBar" for component "Test".',
        startPosition: {
          line: 2,
          character: 18
        },
        endPosition: {
          line: 2,
          character: 26
        }
      }, ['element', 'kebab-case']);
    });
  });
  describe('valid component selector', () => {
    it('should succeed when set valid selector in @Component', () => {
      let source = `
      @Component({
        selector: 'bar-foo'
      })
      class Test {}`;
      assertSuccess('component-selector', source, ['element', 'kebab-case']);
    });
  });
});

describe('directive-selector', () => {
  describe('invalid directive selector', () => {
    it('should fail when directive used as element', () => {
      let source = `
      @Directive({
        selector: 'foo-bar'
      })
      class Test {}`;
      assertFailure('directive-selector', source, {
        message: 'Invalid selector "foo-bar" for directive "Test".',
        startPosition: {
          line: 2,
          character: 18
        },
        endPosition: {
          line: 2,
          character: 27
        }
      }, ['attribute', 'camelCase']);
    });
  });
  describe('valid directive selector', () => {
    it('should succeed when set valid selector in @Directive', () => {
      let source = `
      @Directive({
        selector: '[foo]'
      })
      class Test {}`;
      assertSuccess('directive-selector', source, ['attribute', 'camelCase']);
    });
  });
});
