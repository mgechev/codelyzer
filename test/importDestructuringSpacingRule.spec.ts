import {assertFailure, assertSuccess} from './testHelper';

describe('import-destructruing-spacing', () => {
  describe('invalid import spacing', () => {
    it('should fail when the imports have no spaces', () => {
      let source = `import {Foo} from './foo'`;

      assertFailure('import-destructuring-spacing', source, {
        message: 'You need to leave whitespaces inside of the import statement\'s curly braces ($$03-05$$)',
        startPosition: {
          line: 0,
          character: 7
        },
        endPosition: {
          line: 0,
          character: 12
        }
      });
    });

    it('should fail with multiple items to import', () => {
      let source = `import {Foo,Bar} from './foo'`;

      assertFailure('import-destructuring-spacing', source, {
        message: 'You need to leave whitespaces inside of the import statement\'s curly braces ($$03-05$$)',
        startPosition: {
          line: 0,
          character: 7
        },
        endPosition: {
          line: 0,
          character: 16
        }
      });
    });

    it('should fail with spaces between items', () => {
      let source = `import {Foo,  Bar} from './foo'`;

      assertFailure('import-destructuring-spacing', source, {
        message: 'You need to leave whitespaces inside of the import statement\'s curly braces ($$03-05$$)',
        startPosition: {
          line: 0,
          character: 7
        },
        endPosition: {
          line: 0,
          character: 18
        }
      });
    });
    it('should fail with only one whitespace in the left', () => {
      let source = `import { Foo} from './foo';`

      assertFailure('import-destructuring-spacing', source, {
        message: 'You need to leave whitespaces inside of the import statement\'s curly braces ($$03-05$$)',
        startPosition: {
          line: 0,
          character: 7
        },
        endPosition: {
          line: 0,
          character: 13
        }
      });
    });

    it('should fail with only one whitespace in the right', () => {
      let source = `import {Foo } from './foo';`

      assertFailure('import-destructuring-spacing', source, {
        message: 'You need to leave whitespaces inside of the import statement\'s curly braces ($$03-05$$)',
        startPosition: {
          line: 0,
          character: 7
        },
        endPosition: {
          line: 0,
          character: 13
        }
      });
    });
  });

  describe('valid import spacing', () => {
    it('should succed with valid spacing', () => {
      let source = `import { Foo } from './foo';`
      assertSuccess('import-destructuring-spacing', source);
    });
    it('should work with alias imports', () => {
      let source = `import * as Foo from './foo';`
      assertSuccess('import-destructuring-spacing', source);
    });
  });
});