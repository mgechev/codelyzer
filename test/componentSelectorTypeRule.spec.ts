import {assertFailure, assertSuccess} from './testHelper';

describe('component-selector-type', () => {
  describe('invalid component selectors', () => {
    const expectedFailure = {
      message: 'The selector of the component "Test" should be used as element ($$05-03$$)',
      startPosition: {
        line: 2,
        character: 18
      },
      endPosition: {
        line: 2,
        character: 28
      }
    };

    it('should fail when component used as attribute', () => {
      let source = `
      @Component({
        selector: '[fooBar]'
      })
      class Test {}`;
      assertFailure('component-selector-type', source, expectedFailure, 'element');
    });

    it( `should properly handle es6 template literals`, () => {
      let source = `
      @Component({
        selector: \`[fooBar]\`
      })
      class Test {}`;

      assertFailure('component-selector-type', source, expectedFailure, 'element');
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
