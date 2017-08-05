import { assertSuccess, assertAnnotated } from './testHelper';

describe('templates-use-public', () => {
  describe('invalid expressions', () => {
    it('should fail inline property private declaration', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '{{ foo }}'
                        ~~~
        })
        class Test {
          constructor(private foo: number) {}
        }`;
        assertAnnotated({
          ruleName: 'templates-use-public',
          message: 'You can bind only to public class members. "foo" is not a public class member.',
          source
        });
    });

    it('should fail when interpolating private property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
                             ~~~
        })
        class Test {
          private foo: number;
        }`;
      assertAnnotated({
        ruleName: 'templates-use-public',
        message: 'You can bind only to public class members. "foo" is not a public class member.',
        source
      });
    });

    it('should fail when interpolating protected property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
                             ~~~
        })
        class Test {
          protected foo: number;
        }`;
      assertAnnotated({
        ruleName: 'templates-use-public',
        message: 'You can bind only to public class members. "foo" is not a public class member.',
        source
      });
    });

    it('should fail when interpolating protected nested property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo.bar }}</div>
                             ~~~
        })
        class Test {
          protected foo: number;
        }`;
      assertAnnotated({
        ruleName: 'templates-use-public',
        message: 'You can bind only to public class members. "foo" is not a public class member.',
        source
      });
    });

    it('should fail when interpolating protected nested property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div (click)="foo.bar = 2"></div>'
                                   ~~~
        })
        class Test {
          protected foo: number;
        }`;
      assertAnnotated({
        ruleName: 'templates-use-public',
        message: 'You can bind only to public class members. "foo" is not a public class member.',
        source
      });
    });

    it('should fail when binding to protected method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div [bar]="foo()"></div>
                                 ~~~
        })
        class Test {
          protected foo() {};
        }`;
      assertAnnotated({
        ruleName: 'templates-use-public',
        message: 'You can bind only to public class members. "foo" is not a public class member.',
        source
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

    it('should succeed shadowed variable', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`
            <div *ngFor="let smile of smile">
              <smile-cmp [smile]="smile"></smile-cmp>
            </div>
          \`
        })
        class Test {
          smile: any;
        }`;
      assertSuccess('templates-use-public', source);
    });

    // Angular doesn't provide the correct source span of the property.
    it('should fail when private property used in *ngFor', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`
            <div *ngFor="let smile of smile2">
                                       ~~~~~~
              <smile-cmp [smile]="smile"></smile-cmp>
            </div>
          \`
        })
        class Test {
          private smile2: any;
        }`;
      assertAnnotated({
        ruleName: 'templates-use-public',
        message: 'You can bind only to public class members. "smile2" is not a public class member.',
        source
      });
    });

    // Angular doesn't provide the correct source span of the property.
    it('should fail when private property used in *ngFor', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`
            <div *ngFor="let smile of smile">
                                       ~~~~~
              <smile-cmp [smile]="smile"></smile-cmp>
            </div>
          \`
        })
        class Test {
          private smile: any;
        }`;
      assertAnnotated({
        ruleName: 'templates-use-public',
        message: 'You can bind only to public class members. "smile" is not a public class member.',
        source
      });
    });
  });

  describe('binding to complex data structure', () => {

    it('should work with binding to an array', () => {
      const source = `
        @Component({
          template: '<span>{{ something["a"].b }}</span>'
        })
        export class DemoComponent {
          public something: { a: any } = { a: { b: 1 } };
        }
      `;
      assertSuccess('templates-use-public', source);
    });

    it('should work with binding to an array of specific class', () => {
      const source = `
        class Something {
          public a = 1;
          public b = 2;
        }

        @Component({
          template: '<span>{{ something[0].a }}</span>'
        })
        export class DemoComponent {
          public something: Something[] = [new Something()];
        }
      `;
      assertSuccess('templates-use-public', source);
    });

  });
});
