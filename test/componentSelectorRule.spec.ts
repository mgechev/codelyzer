import {assertFailure, assertSuccess} from './testHelper';

describe('component-selector-name', () => {
    describe('invalid component selectors', () => {
        it('should fail when component named camelCase', () => {
            let source = `
      @Component({
        selector: 'fooBar'
      })
      class Test {}`;
            assertFailure('component-selector', source, {
                message: 'The selector of the component "Test" should be named kebab-case ($$05-02$$)',
                startPosition: {
                    line: 2,
                    character: 18
                },
                endPosition: {
                    line: 2,
                    character: 26
                }
            }, ["element", ["sg","ng"], "kebab-case"]);
        });

        it('should fail when the selector of component does not contain hyphen character', () => {
            let source = `
      @Component({
        selector: 'foobar'
      })
      class Test {}`;
            assertFailure('component-selector', source, {
                message: 'The selector of the component "Test" should be named kebab-case ($$05-02$$)',
                startPosition: {
                    line: 2,
                    character: 18
                },
                endPosition: {
                    line: 2,
                    character: 26
                }
            }, ["element", ["sg","ng"], "kebab-case"]);
        });
    });
    describe('valid component selector', () => {
        it('should succeed when set valid selector in @Component', () => {
            let source = `
      @Component({
        selector: 'sg-bar-foo'
      })
      class Test {}`;
            assertSuccess('component-selector', source, ["element", ["sg","ng"], "kebab-case"]);
        });
        it('should succeed with empty file', () => {
            let source = ``;
            assertSuccess('component-selector', source, ["element", ["sg","ng"], "kebab-case"]);
        });
        it('should ignore the selector when it\'s not literal', () => {
            let source = `
      const selectorName = 'fooBar';
      @Component({
        selector: selectorName
      })
      class Test {}`;
            assertSuccess('component-selector', source, ["element", ["sg","ng"], "kebab-case"]);
        });
        it('should succeed when is used, with multiple selectors', () => {
            let source = `
      @Component({
        selector: 'sg-foo-bar.test[test2]:not(p)'
      })
      class Test {}`;
            assertSuccess('component-selector', source, ["element", ["sg","ng"], "kebab-case"]);
        });
    });
});
describe('component-selector-prefix', () => {
    describe('invalid component selectors', () => {
        it('should fail when component used without prefix', () => {
            let source = `
          @Component({
            selector: 'foo-bar'
          })
          class Test {}`;
            assertFailure('component-selector', source, {
                message: 'The selector of the component "Test" should have prefix "sg" ($$02-07$$)',
                startPosition: {
                    line: 2,
                    character: 22
                },
                endPosition: {
                    line: 2,
                    character: 31
                }
            }, ["element", "sg","ng", "kebab-case"]);
        });

        it('should fail when component used without prefix applying multiple prefixes', () => {
            let source = `
          @Component({
            selector: 'foo-bar'
          })
      class Test {}`;
            assertFailure('component-selector', source, {
                message: 'The selector of the component "Test" should have one of the prefixes: sg,mg,ng ($$02-07$$)',
                startPosition: {
                    line: 2,
                    character: 22
                },
                endPosition: {
                    line: 2,
                    character: 31
                }
            }, ["element", ["sg","mg","ng"], "kebab-case"]);
        });
    });

    describe('valid component selector', () => {
        it('should succeed when set valid selector in @Component', () => {
            let source = `
      @Component({
        selector: 'sg-bar-foo'
      })
      class Test {}`;
            assertSuccess('component-selector', source, ["element", "sg", "kebab-case"]);
        });

        it('should succeed when set valid selector in @Component using multiple prefixes', () => {
            let source = `
      @Component({
        selector: 'sg-bar-foo'
      })
      class Test {}`;
            assertSuccess('component-selector', source, ["element", ["sg","ng","mg"], "kebab-case"]);
        });
    });
});
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
            assertFailure('component-selector', source, expectedFailure, ["element", ["sg","ng"], "kebab-case"]);
        });

        it( `should properly handle es6 template literals`, () => {
            let source = `
      @Component({
        selector: \`[fooBar]\`
      })
      class Test {}`;

            assertFailure('component-selector', source, expectedFailure, ["element", ["sg","ng"], "kebab-case"]);
        });
    });

    describe('valid component selector', () => {
        it('should succeed when set valid selector in @Component', () => {
            let source = `
      @Component({
        selector: 'sg-bar-foo'
      })
      class Test {}`;
            assertSuccess('component-selector', source, ["element", ["sg","ng"], "kebab-case"]);
        });
    });
});
