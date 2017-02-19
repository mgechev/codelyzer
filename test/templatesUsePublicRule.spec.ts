import {assertFailure, assertSuccess} from './testHelper';

describe('templates-use-public', () => {
  describe('invalid expressions', () => {
    it('should fail inline property private declaration', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '{{ foo }}'
        })
        class Test {
          constructor(private foo: number) {}
        }`;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members. "foo" is not a public class member.',
          startPosition: {
            line: 3,
            character: 24
          },
          endPosition: {
            line: 3,
            character: 27
          }
       });
    });

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
          message: 'You can bind only to public class members. "foo" is not a public class member.',
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
          message: 'You can bind only to public class members. "foo" is not a public class member.',
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

    it('should fail when interpolating protected nested property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo.bar }}</div>
        })
        class Test {
          protected foo: number;
        }`;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members. "foo" is not a public class member.',
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

    it('should fail when interpolating protected nested property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div (click)="foo.bar = 2"></div>
        })
        class Test {
          protected foo: number;
        }`;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members. "foo" is not a public class member.',
          startPosition: {
            line: 3,
            character: 35
          },
          endPosition: {
            line: 3,
            character: 38
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
          message: 'You can bind only to public class members. "foo" is not a public class member.',
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

    it('should succeed inline property public declaration', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '{{ foo }}'
        })
        class Test {
          constructor(public foo: number) {}
        }`;
        assertSuccess('templates-use-public', source);
    });

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

    it('should succeed on public nested props', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo.baz.bar }}</div>
        })
        class Test {
          foo = {};
        }`;
        assertSuccess('templates-use-public', source);
    });


    it('should succeed on public nested props', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo[1].baz.bar }}</div>
        })
        class Test {
          foo: any;
        }`;
        assertSuccess('templates-use-public', source);
    });


    it('should succeed on public nested props', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        class Test {
          readonly foo: any;
        }`;
        assertSuccess('templates-use-public', source);
    });
  });
});
