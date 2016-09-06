import {assertFailure, assertSuccess} from './testHelper';

describe('access-missing-declaration', () => {
  describe('invalid component class suffix', () => {
    it('should fail when the selector of component does not contain hyphen character', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        class Test {
          bar: number;
        }`;
        assertFailure('access-missing-declaration', source, {
          message: 'The field "foo" that you\'re trying to access does not exist in the class declaration.',
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
    it('should fail when the selector of component does not contain hyphen character', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ baz() }}</div>
        })
        class Test {
          bar() {}
        }`;
        assertFailure('access-missing-declaration', source, {
          message: 'The field "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
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
    it('should fail when the selector of component does not contain hyphen character', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ baz2() + foo }}</div>
        })
        class Test {
          baz2() {}
        }`;
        assertFailure('access-missing-declaration', source, {
          message: 'The field "foo" that you\'re trying to access does not exist in the class declaration.',
          startPosition: {
            line: 3,
            character: 38
          },
          endPosition: {
            line: 3,
            character: 41
          }
       });
    });
    it('should fail when the selector of component does not contain hyphen character', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ baz() + getPrsonName(1, 2, 3) }}</div>
        })
        class Test {
          baz() {}
          getPersonName() {}
        }`;
        assertFailure('access-missing-declaration', source, {
          message: 'The field "getPrsonName" that you\'re trying to access does not exist in the class declaration. Probably you mean: "getPersonName".',
          startPosition: {
            line: 3,
            character: 37
          },
          endPosition: {
            line: 3,
            character: 49
          }
       });
    });
  });

  describe('valid component class name', () => {
    it('should fail when the selector of component does not contain hyphen character', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        class Test {
          foo: number;
        }`;
        assertSuccess('access-missing-declaration', source);
    });
    it('should fail when the selector of component does not contain hyphen character', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo() }}</div>
        })
        class Test {
          foo() {}
        }`;
        assertSuccess('access-missing-declaration', source);
    });
  });
});
