import {assertFailure, assertSuccess} from './testHelper';

describe('access-missing-declaration', () => {
  describe('invalid expressions', () => {
    it('should fail when interpolating private property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        class Test {
          private foo: number;
        }`;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members.',
          startPosition: {
            line: 3,
            character: 29
          },
          endPosition: {
            line: 3,
            character: 32
          }
       });
    });

    it('should fail when interpolating protected property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        class Test {
          protected foo: number;
        }`;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members.',
          startPosition: {
            line: 3,
            character: 29
          },
          endPosition: {
            line: 3,
            character: 32
          }
       });
    });

    it('should fail when binding to protected method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div [bar]="foo()"></div>
        })
        class Test {
          protected foo() {};
        }`;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members.',
          startPosition: {
            line: 3,
            character: 33
          },
          endPosition: {
            line: 3,
            character: 36
          }
       });
    });

  });

  describe('valid expressions', () => {
    it('should succeed with public property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        class Test {
          foo: number;
        }`;
        assertSuccess('templates-use-public', source);
    });

    it('should succeed with non-existing property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        class Test {
        }`;
        assertSuccess('templates-use-public', source);
    });

    it('should succeed on public method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo() }}</div>
        })
        class Test {
          public foo() {}
        }`;
        assertSuccess('templates-use-public', source);
    });
  });
});
