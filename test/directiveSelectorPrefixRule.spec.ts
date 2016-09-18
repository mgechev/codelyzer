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
                message: 'The selector of the directive "Test" should have prefix "sg" ($$02-08$$)',
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

        it('should fail when directive used without prefix applying multiple prefixes', () => {
            let source = `
          @Directive({
            selector: 'foo-bar'
          })
          class Test {}`;
            assertFailure('directive-selector-prefix', source, {
                message: 'The selector of the directive "Test" should have one of the prefixes: sg,ng,mg ($$02-08$$)',
                startPosition: {
                    line: 2,
                    character: 22
                },
                endPosition: {
                    line: 2,
                    character: 31
                }
            }, ['sg', 'ng', 'mg']);
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

        it('should succeed when set valid selector in @Directive using multiple prefixes', () => {
            let source = `
      @Directive({
        selector: 'ngBarFoo'
      })
      class Test {}`;
            assertSuccess('directive-selector-prefix', source, ['ng', 'sg', 'mg']);
        });
    });
});
