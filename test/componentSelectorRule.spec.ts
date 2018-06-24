import { assertSuccess, assertAnnotated, assertMultipleAnnotated } from './testHelper';

describe('component-selector-prefix', () => {
  describe('invalid component selectors', () => {
    it('should fail when component used without prefix', () => {
      let source = `
        @Component({
          selector: 'foo-bar'
                    ~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'component-selector',
        message: 'The selector of the component "Test" should have prefix "sg" (https://angular.io/styleguide#style-02-07)',
        source,
        options: ['element', 'sg', 'kebab-case']
      });
    });

    it('should fail when component used without prefix applying multiple prefixes', () => {
      let source = `
        @Component({
          selector: 'foo-bar'
                    ~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'component-selector',
        message:
          'The selector of the component "Test" should have one of the prefixes "sg, mg, ng"' +
          ' (https://angular.io/styleguide#style-02-07)',
        source,
        options: ['element', ['sg', 'mg', 'ng'], 'kebab-case']
      });
    });
    it('should fail when component used without prefix applying multiple prefixes and selectors', () => {
      let source = `
        @Component({
          selector: 'foo-bar[baz].bar'
                    ~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'component-selector',
        message:
          'The selector of the component "Test" should have one of the prefixes "sg, mg, ng"' +
          ' (https://angular.io/styleguide#style-02-07)',
        source,
        options: ['element', ['sg', 'mg', 'ng'], 'kebab-case']
      });
    });

    it('should fail when component used longer prefix', () => {
      let source = `
        @Component({selector: 'foo-bar'}) class TestOne {}
                              ~~~~~~~~~
        @Component({selector: 'ngg-bar'}) class TestTwo {}
                              ^^^^^^^^^
      `;
      assertMultipleAnnotated({
        ruleName: 'component-selector',
        failures: [
          {
            char: '~',
            msg:
              'The selector of the component "TestOne" should have one of the prefixes "fo, mg, ng"' +
              ' (https://angular.io/styleguide#style-02-07)'
          },
          {
            char: '^',
            msg:
              'The selector of the component "TestTwo" should have one of the prefixes "fo, mg, ng"' +
              ' (https://angular.io/styleguide#style-02-07)'
          }
        ],
        source,
        options: ['element', ['fo', 'mg', 'ng'], 'kebab-case']
      });
    });
  });

  describe('valid component selector', () => {
    it('should succeed when set valid selector in @Component', () => {
      let source = `
        @Component({
          selector: 'sg-bar-foo'
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, ['element', 'sg', 'kebab-case']);
    });

    it('should succeed when set valid selector in @Component using multiple prefixes', () => {
      let source = `
        @Component({
          selector: 'sg-bar-foo'
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, ['element', ['sg', 'ng', 'mg'], 'kebab-case']);
    });

    it('should succeed when set valid selector in @Component using multiple prefixes and some prefixes are substring of others', () => {
      let source = `
        @Component({
          selector: 'abc-bar-foo'
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, ['element', ['ab', 'abc', 'mg'], 'kebab-case']);
    });

    it('should succeed without prefix', () => {
      let source = `
        @Component({
          selector: 'sg-bar-foo'
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, ['element', [], 'kebab-case']);
    });

    it('should succeed with null prefix', () => {
      let source = `
        @Component({
          selector: 'sg-bar-foo'
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, ['element', null, 'kebab-case']);
    });

    it('should succeed when set valid selector in @Component using multiple prefixes and attribute type', () => {
      let source = `
        @Component({
          selector: '[sg-bar-foo]'
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, ['attribute', ['sg', 'ng', 'mg'], 'kebab-case']);
    });
  });
});

describe('component-selector-type', () => {
  describe('invalid component selectors', () => {
    it('should fail when component used as attribute', () => {
      let source = `
        @Component({
          selector: '[fooBar]'
                    ~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'component-selector',
        message: 'The selector of the component "Test" should be used as element (https://angular.io/styleguide#style-05-03)',
        source,
        options: ['element', ['sg', 'ng'], 'kebab-case']
      });
    });

    it('should properly handle es6 template literals', () => {
      let source = `
        @Component({
          selector: \`[fooBar]\`
                    ~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'component-selector',
        message: 'The selector of the component "Test" should be used as element (https://angular.io/styleguide#style-05-03)',
        source,
        options: ['element', ['sg', 'ng'], 'kebab-case']
      });
    });

    it('should accept several selector types', () => {
      let source = `
        @Component({
          selector: \`[fooBar]\`
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, [['element', 'attribute'], ['foo', 'ng'], 'camelCase']);
    });
  });

  describe('valid component selector', () => {
    it('should succeed when set valid selector in @Component', () => {
      let source = `
        @Component({
          selector: 'sg-bar-foo'
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, ['element', ['sg', 'ng'], 'kebab-case']);
    });

    it('should succeed when set valid selector in @Component with multiple selectors', () => {
      let source = `
        @Component({
          selector: 'sg-bar-foo[baz].bar'
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, ['element', ['sg', 'ng'], 'kebab-case']);
    });

    it('should succeed when set valid selector in @Component with multiple selectors and attribute type', () => {
      let source = `
        @Component({
          selector: 'baz[sg-bar-foo][foe].bar'
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, ['attribute', ['sg', 'ng'], 'kebab-case']);
    });
  });
});

describe('component-selector-name', () => {
  describe('invalid component selectors', () => {
    it('should fail when component named camelCase', () => {
      let source = `
        @Component({
          selector: 'sgFooBar'
                    ~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'component-selector',
        message:
          'The selector of the component "Test" should be named kebab-case and include dash ' +
          '(https://angular.io/styleguide#style-05-02)',
        source,
        options: ['element', 'sg', 'kebab-case']
      });
    });

    it('should fail when the selector of component does not contain hyphen character', () => {
      let source = `
        @Component({
          selector: 'sgfoobar'
                    ~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'component-selector',
        message:
          'The selector of the component "Test" should be named kebab-case and include dash ' +
          '(https://angular.io/styleguide#style-05-02)',
        source,
        options: ['element', 'sg', 'kebab-case']
      });
    });
  });

  describe('valid component selector', () => {
    it('should succeed when set valid selector in @Component', () => {
      let source = `
        @Component({
          selector: 'sg-bar-foo'
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, ['element', 'sg', 'kebab-case']);
    });

    it('should succeed with empty file', () => {
      let source = '';
      assertSuccess('component-selector', source, ['element', 'sg', 'kebab-case']);
    });

    it("should ignore the selector when it's not literal", () => {
      let source = `
        const selectorName = 'sgFooBar';
        @Component({
          selector: selectorName
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, ['element', 'sg', 'kebab-case']);
    });

    it('should succeed when set valid selector in @Component with multi selectors, attribute type and camelCase', () => {
      let source = `
        @Component({
          selector: 'baz[sgBarFoo][baz].baz'
        })
        class Test {}
      `;
      assertSuccess('component-selector', source, ['attribute', 'sg', 'camelCase']);
    });
  });
});
