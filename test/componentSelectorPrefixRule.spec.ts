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
                message: 'The selector of the component "Test" should have prefix "sg" ($$02-07$$)',
                startPosition: {
                    line: 2,
                    character: 22
                },
                endPosition: {
                    line: 2,
                    character: 31
                }
            }, 'sg');
        });

        it('should fail when component used without prefix applying multiple prefixes', () => {
            let source = `
          @Component({
            selector: 'foo-bar'
          })
      class Test {}`;
            assertFailure('component-selector-prefix', source, {
                message: 'The selector of the component "Test" should have one of the prefixes: sg,mg,ng ($$02-07$$)',
                startPosition: {
                    line: 2,
                    character: 22
                },
                endPosition: {
                    line: 2,
                    character: 31
                }
            }, ['sg', 'mg', 'ng']);
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

        it('should succeed when set valid selector in @Component using multiple prefixes', () => {
            let source = `
      @Component({
        selector: 'sg-bar-foo'
      })
      class Test {}`;
            assertSuccess('component-selector-prefix', source, ['ng', 'sg', 'mg']);
        });
    });
});
