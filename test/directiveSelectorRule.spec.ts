import {assertFailure, assertSuccess} from './testHelper';

describe('directive-selector-name', () => {
    describe('invalid directive selectors', () => {
        it('should fail when directive named kebab-case', () => {
            let source = `
      @Directive({
        selector: '[sg-foo-bar]'
      })
      class Test {}`;
            assertFailure('directive-selector', source, {
                message: 'The selector of the directive "Test" should be named camelCase ($$02-06$$)',
                startPosition: {
                    line: 2,
                    character: 18
                },
                endPosition: {
                    line: 2,
                    character: 32
                }
            }, ['attribute','sg','camelCase']);
        });
    });
    describe('valid directive selector, using multiple selectors', () => {
        it('should succeed when set valid selector in @Directive', () => {
            let source = `
      @Directive({
        selector: 'test[sgBarFoo].test:not(p)'
      })
      class Test {}`;
            assertSuccess('directive-selector', source, ['attribute','sg','camelCase']);
        });
    });
    describe('valid directive selector, using multiple selectors, element type and kebap-case', () => {
        it('should succeed when set valid selector in @Directive', () => {
            let source = `
      @Directive({
        selector: 'sg-bar-foo[test].test:not(p)'
      })
      class Test {}`;
            assertSuccess('directive-selector', source, ['element','sg','kebab-case']);
        });
    });
    describe('invalid directive selector, using multiple selectors', () => {
        it('should succeed when set valid selector in @Directive and multiple selectors', () => {
            let source = `
      @Directive({
        selector: 'test[sg-bar-foo].test:not(p)'
      })
      class Test {}`;
            assertFailure('directive-selector', source, {
                message: 'The selector of the directive "Test" should be named camelCase ($$02-06$$)',
                startPosition: {
                    line: 2,
                    character: 18
                },
                endPosition: {
                    line: 2,
                    character: 48
                }
            }, ['attribute','sg','camelCase']);
        });
    });
});
describe('directive-selector-prefix', () => {
    describe('invalid directive selectors', () => {
        it('should fail when directive used without prefix', () => {
            let source = `
          @Directive({
            selector: '[fooBar]'
          })
          class Test {}`;
            assertFailure('directive-selector', source, {
                message: 'The selector of the directive "Test" should have prefix "sg" ($$02-08$$)',
                startPosition: {
                    line: 2,
                    character: 22
                },
                endPosition: {
                    line: 2,
                    character: 32
                }
            }, ['attribute','sg','camelCase']);
        });

        it('should fail when directive used without longer prefix', () => {
            let source = `
          @Directive({
            selector: '[fooBar]'
          })
          class Test {}`;
            assertFailure('directive-selector', source, {
                message: 'The selector of the directive "Test" should have prefix "fo" ($$02-08$$)',
                startPosition: {
                    line: 2,
                    character: 22
                },
                endPosition: {
                    line: 2,
                    character: 32
                }
            }, ['attribute','fo','camelCase']);
        });

        it('should fail when directive used without prefix applying multiple prefixes', () => {
            let source = `
          @Directive({
            selector: '[fooBar]'
          })
          class Test {}`;
            assertFailure('directive-selector', source, {
                message: 'The selector of the directive "Test" should have one of the prefixes: sg,ng,mg ($$02-08$$)',
                startPosition: {
                    line: 2,
                    character: 22
                },
                endPosition: {
                    line: 2,
                    character: 32
                }
            }, ['attribute',['sg', 'ng', 'mg'],'camelCase']);
        });
        it('should fail when directive used without prefix applying multiple prefixes and selectors', () => {
            let source = `
          @Directive({
            selector: 'baz.bar[fooBar]'
          })
          class Test {}`;
            assertFailure('directive-selector', source, {
                message: 'The selector of the directive "Test" should have one of the prefixes: sg,ng,mg ($$02-08$$)',
                startPosition: {
                    line: 2,
                    character: 22
                },
                endPosition: {
                    line: 2,
                    character: 39
                }
            }, ['attribute',['sg', 'ng', 'mg'],'camelCase']);
        });
    });
    describe('valid directive selector', () => {
        it('should succeed when set valid selector in @Directive', () => {
            let source = `
      @Directive({
        selector: '[sgBarFoo]'
      })
      class Test {}`;
            assertSuccess('directive-selector', source, ['attribute','sg','camelCase']);
        });

        it('should succeed when set valid selector in @Directive using multiple prefixes', () => {
            let source = `
      @Directive({
        selector: '[ngBarFoo]'
      })
      class Test {}`;
            assertSuccess('directive-selector', source, ['attribute',['ng','sg','mg'],'camelCase']);
        });
        it('should succeed when set valid selector in @Directive using multiple prefixes and selectors', () => {
            let source = `
      @Directive({
        selector: 'bar[ngBarFoo].baz'
      })
      class Test {}`;
            assertSuccess('directive-selector', source, ['attribute',['ng','sg','mg'],'camelCase']);
        });
    });
});
describe('directive-selector-type', () => {
    describe('invalid directive selectors', () => {
        it('should fail when directive used as attribute', () => {
            let source = `
      @Directive({
        selector: 'foo-bar'
      })
      class Test {}`;
            assertFailure('directive-selector', source, {
                message: 'The selector of the directive "Test" should be used as attribute ($$02-06$$)',
                startPosition: {
                    line: 2,
                    character: 18
                },
                endPosition: {
                    line: 2,
                    character: 27
                }
            }, ['attribute','sg','camelCase']);
        });
    });
    describe('invalid directive selector, using multiple selectors', () => {
        it('should fail when set non attribute selectors in @Directive', () => {
            let source = `
      @Directive({
        selector: 'test.test:not(p)'
      })
      class Test {}`;
            assertFailure('directive-selector', source, {
                message: 'The selector of the directive "Test" should be used as attribute ($$02-06$$)',
                startPosition: {
                    line: 2,
                    character: 18
                },
                endPosition: {
                    line: 2,
                    character: 36
                }
            }, ['attribute','sg','camelCase']);
        });
    });
    describe('valid directive selector', () => {
        it('should succeed when set valid selector in @Directive', () => {
            let source = `
      @Directive({
        selector: '[sgBarFoo]'
      })
      class Test {}`;
            assertSuccess('directive-selector', source, ['attribute','sg','camelCase']);
        });
        it('should not validate @Component', () => {
            let source = `
      @Component({
        selector: 'sg-bar-foo'
      })
      class Test {}`;
            assertSuccess('directive-selector', source, ['attribute','sg','camelCase']);
        });
        it('should succeed when set valid selector using multiple selectors in @Directive', () => {
            let source = `
      @Directive({
        selector: 'baz[sgBarFoo].bai'
      })
      class Test {}`;
            assertSuccess('directive-selector', source, ['attribute','sg','camelCase']);
        });

        it('should succeed when set valid selector using multiple selectors in @Directive', () => {
            let source = `
            @Directive({
              selector: '[past][formControlName],[past][formControl],[past][ngModel]',
              providers: [{
                provide: NG_VALIDATORS,
                useExisting: forwardRef(() => DatePastValidator),
                multi: true,
              }],
              host: {'[attr.date]': 'date? "" : null'},
            })
            class Test {}`;
            assertSuccess('directive-selector', source, ['attribute', 'ng','camelCase']);
        });
    });
});
