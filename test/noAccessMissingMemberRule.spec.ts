import {assertFailure, assertSuccess} from './testHelper';

describe('no-access-missing-member', () => {
  describe('invalid expressions', () => {
    it('should fail when interpolating missing property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        class Test {
          bar: number;
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The property "foo" that you\'re trying to access does not exist in the class declaration.',
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

    it('should fail when using missing method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ baz() }}</div>
        })
        class Test {
          bar() {}
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
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

    it('should fail when using missing method in an interpolation mixed with text', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div> test {{ baz() }}</div>
        })
        class Test {
          bar() {}
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
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

    it('should fail when using missing method in an interpolation mixed with text and interpolation', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div> test {{ bar() }} {{ baz() }}</div>
        })
        class Test {
          bar() {}
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
          startPosition: {
            line: 3,
            character: 47
          },
          endPosition: {
            line: 3,
            character: 50
          }
       });
    });

    it('should fail when using missing method in an interpolation mixed with text, interpolation & binary expression', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div> test {{ bar() }} {{ bar() + baz() }}</div>
        })
        class Test {
          bar() {}
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
          startPosition: {
            line: 3,
            character: 55
          },
          endPosition: {
            line: 3,
            character: 58
          }
       });
    });

    it('should fail in binary operation with missing property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ baz2() + foo }}</div>
        })
        class Test {
          baz2() {}
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The property "foo" that you\'re trying to access does not exist in the class declaration.',
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

    it('should fail fail in binary operation with missing method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ baz() + getPrsonName(1, 2, 3) }}</div>
        })
        class Test {
          baz() {}
          getPersonName() {}
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "getPrsonName" that you\'re trying to access does not exist in the class declaration. Probably you mean: "getPersonName".',
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

    it('should fail with property binding and missing method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div [className]="bar()"></div>
        })
        class Test {
          baz() {}
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
          startPosition: {
            line: 3,
            character: 39
          },
          endPosition: {
            line: 3,
            character: 42
          }
       });
    });

    it('should fail with style binding and missing method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div [style.color]="bar()"></div>
        })
        class Test {
          baz() {}
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
          startPosition: {
            line: 3,
            character: 41
          },
          endPosition: {
            line: 3,
            character: 44
          }
       });
    });

    it('should fail on event handling with missing method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div (click)="bar()"></div>
        })
        class Test {
          baz() {}
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
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

    it('should fail on event handling on the right position with a lot of whitespace', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div (click)=   "   bar()"></div>
        })
        class Test {
          baz() {}
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
          startPosition: {
            line: 3,
            character: 41
          },
          endPosition: {
            line: 3,
            character: 44
          }
       });
    });

    it('should fail on event handling on the right position with spaces and newlines', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div [class.foo]=   "
            bar()"></div>\`
        })
        class Test {
          baz() {}
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
          startPosition: {
            line: 4,
            character: 12
          },
          endPosition: {
            line: 4,
            character: 15
          }
       });
    });
  });

  describe('valid expressions', () => {
    it('should succeed with declared property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        class Test {
          foo: number;
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should succeed on declared method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo() }}</div>
        })
        class Test {
          foo() {}
        }`;
        assertSuccess('no-access-missing-member', source);
    });
  });

  describe('nested properties and pipes', () => {
    it('should work with existing single-level nested properties', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo.bar }}</div>
        })
        class Test {
          foo = {};
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with existing single-level non-existing nested properties', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo.bar }}</div>
        })
        class Test {
          foo1 = {};
        }`;
        assertFailure('no-access-missing-member', source, {
          message: 'The property "foo" that you\'re trying to access does not exist in the class declaration. Probably you mean: "foo1".',
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

    it('should work with existing properties and pipes', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo | baz }}</div>
        })
        class Test {
          foo = {};
        }`;
        assertSuccess('no-access-missing-member', source);
    });

  });
});
