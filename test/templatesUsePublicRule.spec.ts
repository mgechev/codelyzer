import {assertFailure, assertSuccess} from './testHelper';

describe('templates-use-public', () => {
  describe('invalid expressions', () => {
    it('should fail inline property private declaration', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '{{ foo }}'
        })
        export class Test {
          constructor(private foo: number) {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members. "foo" is not a public class member.',
          startPosition: {
            line: 5,
            character: 24
          },
          endPosition: {
            line: 5,
            character: 27
          }
       });
    });

    it('should fail when interpolating private property', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        export class Test {
          private foo: number;
        }

        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members. "foo" is not a public class member.',
          startPosition: {
            line: 5,
            character: 29
          },
          endPosition: {
            line: 5,
            character: 32
          }
       });
    });

    it('should fail when interpolating protected property', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        export class Test {
          protected foo: number;
        }

        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members. "foo" is not a public class member.',
          startPosition: {
            line: 5,
            character: 29
          },
          endPosition: {
            line: 5,
            character: 32
          }
       });
    });

    it('should fail when interpolating protected nested property', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo.bar }}</div>
        })
        export class Test {
          protected foo: number;
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members. "foo" is not a public class member.',
          startPosition: {
            line: 5,
            character: 29
          },
          endPosition: {
            line: 5,
            character: 32
          }
       });
    });

    it('should fail when interpolating protected nested property', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div (click)="foo.bar = 2"></div>
        })
        export class Test {
          protected foo: number;
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members. "foo" is not a public class member.',
          startPosition: {
            line: 5,
            character: 35
          },
          endPosition: {
            line: 5,
            character: 38
          }
       });
    });

    it('should fail when binding to protected method', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div [bar]="foo()"></div>
        })
        export class Test {
          protected foo() {};
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members. "foo" is not a public class member.',
          startPosition: {
            line: 5,
            character: 33
          },
          endPosition: {
            line: 5,
            character: 36
          }
       });
    });

  });

  describe('valid expressions', () => {

    it('should succeed inline property public declaration', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '{{ foo }}'
        })
        export class Test {
          constructor(public foo: number) {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('templates-use-public', source);
    });

    it('should succeed with public property', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        export class Test {
          foo: number;
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('templates-use-public', source);
    });

    it('should succeed with non-existing property', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        export class Test {
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('templates-use-public', source);
    });

    it('should succeed on public method', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo() }}</div>
        })
        export class Test {
          public foo() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('templates-use-public', source);
    });

    it('should succeed on public nested props', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo.baz.bar }}</div>
        })
        export class Test {
          foo = {};
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('templates-use-public', source);
    });


    it('should succeed on public nested props', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo[1].baz.bar }}</div>
        })
        export class Test {
          foo: any;
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('templates-use-public', source);
    });


    it('should succeed on public nested props', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        export class Test {
          readonly foo: any;
        }

        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('templates-use-public', source);
    });
  });

  describe('inheritance', () => {
    it('should support inheritance chain', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        export class Base {
          readonly foo: any;
        }

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        export class Test extends Base {}
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('templates-use-public', source);
    });

    it('should fail in case of protected inherited property', () => {
      let source = `
        import {Component, NgModule} from '@angular/core';

        export class Base {
          readonly protected foo: any;
        }

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>
        })
        export class Test extends Base {}

        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('templates-use-public', source, {
          message: 'You can bind only to public class members. "foo" is not a public class member.',
          startPosition: {
            line: 9,
            character: 29
          },
          endPosition: {
            line: 9,
            character: 32
          }
       });
    });
  });
});
