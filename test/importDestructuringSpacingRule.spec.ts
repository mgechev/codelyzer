import { assertAnnotated, assertSuccess } from './testHelper';

describe('import-destructuring-spacing', () => {
  describe('invalid import spacing', () => {
    it('should fail when the imports have no spaces', () => {
      let source = `
                    import {Foo} from './foo'
                           ~~~~~
      `;
      assertAnnotated({
        ruleName: 'import-destructuring-spacing',
        message: 'You need to leave whitespaces inside of the import statement\'s curly braces',
        source
      });
    });

    it('should fail with multiple items to import', () => {
      let source = `
      import {Foo,Bar} from './foo'
             ~~~~~~~~~
      `;
        assertAnnotated({
            ruleName: 'import-destructuring-spacing',
            message: 'You need to leave whitespaces inside of the import statement\'s curly braces',
            source
        });
    });

    it('should fail with spaces between items', () => {
      let source = `
        import {Foo,  Bar} from './foo'
               ~~~~~~~~~~~
        `;
      assertAnnotated({
          ruleName: 'import-destructuring-spacing',
          message: 'You need to leave whitespaces inside of the import statement\'s curly braces',
          source
      });
    });

    it('should fail with only one whitespace in the left', () => {
      let source = `
      import { Foo} from './foo';
             ~~~~~~
      `;
      assertAnnotated({
          ruleName: 'import-destructuring-spacing',
          message: 'You need to leave whitespaces inside of the import statement\'s curly braces',
          source
      });
    });

    it('should fail with only one whitespace in the right', () => {
      let source = `
      import {Foo } from './foo';
             ~~~~~~
       `;
      assertAnnotated({
          ruleName: 'import-destructuring-spacing',
          message: 'You need to leave whitespaces inside of the import statement\'s curly braces',
          source
      });
    });
  });

  describe('valid import spacing', () => {
    it('should succeed with valid spacing', () => {
      let source = `import { Foo } from './foo';`;
      assertSuccess('import-destructuring-spacing', source);
    });

    it('should work with alias imports', () => {
      let source = `import * as Foo from './foo';`;
      assertSuccess('import-destructuring-spacing', source);
    });
  });
});
