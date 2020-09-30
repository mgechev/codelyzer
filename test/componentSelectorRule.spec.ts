import { Rule } from '../src/componentSelectorRule';
import { assertAnnotated, assertMultipleAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    describe('prefix', () => {
      it('should fail if a selector is not prefixed by a valid option', () => {
        const source = `
          @Component({
            selector: 'app-foo-bar'
                      ~~~~~~~~~~~~~
          })
          class Test {}
        `;
        assertAnnotated({
          message: `The selector should be prefixed by "bar" (https://angular.io/guide/styleguide#style-02-07)`,
          options: ['element', 'bar', 'kebab-case'],
          ruleName,
          source,
        });
      });

      it('should fail if a selector is not prefixed by any valid option', () => {
        const source = `
          @Component({
            selector: '[app-foo-bar]'
                      ~~~~~~~~~~~~~~~
          })
          class Test {}
        `;
        assertAnnotated({
          message: `The selector should be prefixed by one of the prefixes: "cd, ng" (https://angular.io/guide/styleguide#style-02-07)`,
          options: ['attribute', ['cd', 'ng'], 'kebab-case'],
          ruleName,
          source,
        });
      });

      it('should fail if a complex selector is not prefixed by any valid option', () => {
        const source = `
          @Component({
            selector: 'app-foo-bar[baz].app'
                      ~~~~~~~~~~~~~~~~~~~~~~
          })
          class Test {}
        `;
        assertAnnotated({
          message: `The selector should be prefixed by one of the prefixes: "foo, cd, ng" (https://angular.io/guide/styleguide#style-02-07)`,
          options: ['element', ['foo', 'cd', 'ng'], 'kebab-case'],
          ruleName,
          source,
        });
      });

      it('should fail if multiple selectors are not prefixed by any valid option', () => {
        const source = `
          @Component({ selector: 'app-bar' }) class TestOne {}
                                 ~~~~~~~~~
          @Component({ selector: 'ngg-bar' }) class TestTwo {}
                                 ^^^^^^^^^
        `;
        const msg = `The selector should be prefixed by one of the prefixes: "ap, cd, ng" (https://angular.io/guide/styleguide#style-02-07)`;
        assertMultipleAnnotated({
          failures: [
            {
              char: '~',
              msg,
            },
            {
              char: '^',
              msg,
            },
          ],
          options: ['element', ['ap', 'cd', 'ng'], 'kebab-case'],
          ruleName,
          source,
        });
      });
    });

    describe('style', () => {
      describe('camelCase', () => {
        it('should fail if a selector is not camelCased', () => {
          const source = `
            @Component({
              selector: '[app-bar-foo]'
                        ~~~~~~~~~~~~~~~
            })
            class Test {}
          `;
          assertAnnotated({
            message: `The selector should be camelCased (https://angular.io/guide/styleguide#style-05-02)`,
            options: ['attribute', 'app', 'camelCase'],
            ruleName,
            source,
          });
        });
      });

      describe('kebab-case', () => {
        it('should fail if a selector is not kebab-cased', () => {
          const source = `
            @Component({
              selector: 'appFooBar'
                        ~~~~~~~~~~~
            })
            class Test {}
          `;
          assertAnnotated({
            message: `The selector should be kebab-cased and include a dash (https://angular.io/guide/styleguide#style-05-02)`,
            options: ['element', 'app', 'kebab-case'],
            ruleName,
            source,
          });
        });

        it('should fail if a selector uses kebab-case style, but no dash', () => {
          const source = `
            @Component({
              selector: 'app'
                        ~~~~~
            })
            class Test {}
          `;
          assertAnnotated({
            message: `The selector should be kebab-cased and include a dash (https://angular.io/guide/styleguide#style-05-02)`,
            options: ['element', 'app', 'kebab-case'],
            ruleName,
            source,
          });
        });
      });
    });

    describe('type', () => {
      describe('attribute', () => {
        it('should fail if a selector is not used as an attribute', () => {
          const source = `
            @Component({
              selector: \`app-foo-bar\`
                        ~~~~~~~~~~~~~
            })
            class Test {}
          `;
          assertAnnotated({
            message: `The selector should be used as an attribute (https://angular.io/guide/styleguide#style-05-03)`,
            options: ['attribute', ['app', 'ng'], 'kebab-case'],
            ruleName,
            source,
          });
        });
      });

      describe('element', () => {
        it('should fail if a selector is not used as an element', () => {
          const source = `
            @Component({
              selector: '[appFooBar]'
                        ~~~~~~~~~~~~~
            })
            class Test {}
          `;
          assertAnnotated({
            message: `The selector should be used as an element (https://angular.io/guide/styleguide#style-05-03)`,
            options: ['element', ['app', 'ng'], 'camelCase'],
            ruleName,
            source,
          });
        });
      });
    });
  });

  describe('success', () => {
    describe('prefix', () => {
      it('should succeed if a selector is prefixed by a valid option', () => {
        const source = `
          @Component({
            selector: 'app-foo-bar'
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['element', 'app', 'kebab-case']);
      });

      it('should succeed if a selector is prefixed by any valid option', () => {
        const source = `
          @Component({
            selector: '[app-foo-bar]'
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['attribute', ['app', 'ng'], 'kebab-case']);
      });

      it('should succeed if a complex selector is prefixed by any valid option', () => {
        const source = `
          @Component({
            selector: 'app-foo-bar[baz].app'
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['element', ['app', 'cd', 'ng'], 'kebab-case']);
      });

      it('should succeed if multiple selectors are prefixed by any valid option', () => {
        const source = `
          @Component({ selector: 'app-bar' }) class TestOne {}
          @Component({ selector: 'ngg-bar' }) class TestTwo {}
        `;
        assertSuccess(ruleName, source, ['element', ['app', 'cd', 'ngg'], 'kebab-case']);
      });
    });

    describe('style', () => {
      describe('camelCase', () => {
        it('should succeed if a selector is camelCased', () => {
          const source = `
            @Component({
              selector: 'appBarFoo'
            })
            class Test {}
          `;
          assertSuccess(ruleName, source, ['element', 'app', 'camelCase']);
        });
      });

      describe('kebab-case', () => {
        it('should succeed if a selector is kebab-cased', () => {
          const source = `
            @Component({
              selector: 'app-foo-bar'
            })
            class Test {}
          `;
          assertSuccess(ruleName, source, ['element', 'app', 'kebab-case']);
        });

        it('should succeed if a selector is not a literal', () => {
          const source = `
            const selectorName = 'appFooBar';

            @Component({
              selector: selectorName
            })
            class Test {}
          `;
          assertSuccess(ruleName, source, ['element', 'app', 'kebab-case']);
        });
      });
    });

    describe('type', () => {
      describe('attribute', () => {
        it('should succeed if a selector is used as an attribute', () => {
          const source = `
            @Component({
              selector: \`[app-foo-bar]\`
            })
            class Test {}
          `;
          assertSuccess(ruleName, source, ['attribute', ['app', 'ng'], 'kebab-case']);
        });

        it('should succeed if there are multiple attribute selectors', () => {
          const source = `
            @Component({
              selector: 'baz[app-bar-foo][foe].bar'
            })
            class Test {}
          `;
          assertSuccess(ruleName, source, ['attribute', ['app', 'ng'], 'kebab-case']);
        });
      });

      describe('element', () => {
        it('should succeed if a selector is used as an element', () => {
          const source = `
            @Component({
              selector: \`appFooBar\`
            })
            class Test {}
          `;
          assertSuccess(ruleName, source, ['element', ['app', 'ng'], 'camelCase']);
        });

        it('should succeed if there are multiple element selectors', () => {
          const source = `
            @Component({
              selector: 'app-bar-foo[baz].bar'
            })
            class Test {}
          `;
          assertSuccess(ruleName, source, ['element', ['app', 'ng'], 'kebab-case']);
        });
      });

      describe('attribute or element', () => {
        it('should succeed if a selector is used as an attribute or element', () => {
          const source = `
            @Component({
              selector: \`[appFooBar]\`
            })
            class Test {}
          `;
          assertSuccess(ruleName, source, [['attribute', 'element'], ['app', 'ng'], 'camelCase']);
        });
      });
    });

    describe('directive', () => {
      it('should succeed if a selector is not prefixed by a valid option, but the class is decorated with @Directive', () => {
        const source = `
          @@Directive({
            selector: 'app-foo-bar'
                      ~~~~~~~~~~~~~
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, [['element'], ['bar'], 'kebab-case']);
      });
    });
  });
});
