import { assertFailure, assertSuccess } from './testHelper';
import {Config} from '../src/angular/config';

describe('no-access-missing-member', () => {
  describe('invalid expressions', () => {
    it('should fail when interpolating missing property', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>'
        })
        export class Test {
          bar: number;
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The property "foo" that you\'re trying to access does not exist in the class declaration.',
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

    it('should work with existing properties and pipes', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: \`<div class="1 + {{ showMenu ? '' : 'pure-hidden-sm' }})"></div>\`
        })
        export class Test {}
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The property "showMenu" that you\'re trying to access does not exist in the class declaration.',
          startPosition: {
            line: 5,
            character: 40
          },
          endPosition: {
            line: 5,
            character: 48
          }
       });
    });

    it('should fail when using missing method', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ baz() }}</div>'
        })
        export class Test {
          bar() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
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

    it('should fail when using missing method in an interpolation mixed with text', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div> test {{ baz() }}</div>'
        })
        export class Test {
          bar() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
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

    it('should fail when using missing method in an interpolation mixed with text and interpolation', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div> test {{ bar() }} {{ baz() }}</div>'
        })
        export class Test {
          bar() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
          startPosition: {
            line: 5,
            character: 47
          },
          endPosition: {
            line: 5,
            character: 50
          }
       });
    });

    it('should fail when using missing method in an interpolation mixed with text, interpolation & binary expression', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div> test {{ bar() }} {{ bar() + baz() }}</div>'
        })
        export class Test {
          bar() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
          startPosition: {
            line: 5,
            character: 55
          },
          endPosition: {
            line: 5,
            character: 58
          }
       });
    });

    it('should fail in binary operation with missing property', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ baz2() + foo }}</div>'
        })
        export class Test {
          baz2() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The property "foo" that you\'re trying to access does not exist in the class declaration.',
          startPosition: {
            line: 5,
            character: 38
          },
          endPosition: {
            line: 5,
            character: 41
          }
       });
    });

    it('should fail fail in binary operation with missing method', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ baz() + getPrsonName(1, 2, 3) }}</div>'
        })
        export class Test {
          baz() {}
          getPersonName() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "getPrsonName" that you\'re trying to access does not ' +
            'exist in the class declaration. Probably you mean: "getPersonName".',
          startPosition: {
            line: 5,
            character: 37
          },
          endPosition: {
            line: 5,
            character: 49
          }
       });
    });

    it('should fail with property binding and missing method', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div [className]="bar()"></div>'
        })
        export class Test {
          baz() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
          startPosition: {
            line: 5,
            character: 39
          },
          endPosition: {
            line: 5,
            character: 42
          }
       });
    });

    it('should fail with style binding and missing method', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div [style.color]="bar()"></div>'
        })
        export class Test {
          baz() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
          startPosition: {
            line: 5,
            character: 41
          },
          endPosition: {
            line: 5,
            character: 44
          }
       });
    });

    it('should fail on event handling with missing method', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div (click)="bar()"></div>'
        })
        export class Test {
          baz() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
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

    it('should fail on event handling on the right position with a lot of whitespace', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div (click)=   "   bar()"></div>'
        })
        export class Test {
          baz() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
          startPosition: {
            line: 5,
            character: 41
          },
          endPosition: {
            line: 5,
            character: 44
          }
       });
    });

    it('should fail on event handling on the right position with spaces and newlines', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: \`<div [class.foo]=   "
            bar()"></div>\`
        })
        export class Test {
          baz() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
          startPosition: {
            line: 6,
            character: 12
          },
          endPosition: {
            line: 6,
            character: 15
          }
       });
    });

    it('should not throw when template ref used outside component scope', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';
        import { FormsModule } from '@angular/forms';

        @Component({
          selector: 'foobar',
          template: '<form #todoForm="ngForm"></form><button [disabled]="!todoForm.form.valid"></button>'
        })
        export class Test {
          foo: number;
        }
        
        @NgModule({
          imports: [FormsModule, CommonModule],
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should not throw when routerLinkActive template ref is used in component', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        @Component({
          selector: 'foobar',
          template: '<a #test="routerLinkActive" [routerLinkActive]="">{{ test }}</a>'
        })
        export class Test {}
        
        @NgModule({
          imports: [RouterModule.forRoot([])],
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should not throw when ngModel template ref is used in component', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';
        import { FormsModule } from '@angular/forms';

        @Component({
          selector: 'foobar',
          template: '<input #test="ngModel" [(ngModel)]="foo">{{ test }}'
        })
        export class Test {
          foo: string;
        }
        
        @NgModule({
          imports: [FormsModule, CommonModule],
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should fail with missing ref', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<bar #todoForm="baz"><button [disabled]="!todoForm.form.valid"></button></bar>'
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
        assertFailure('no-access-missing-member', source, {
          message: 'The property "todoForm" that you\'re trying to access does not exist in the class declaration.',
          startPosition: {
            line: 5,
            character: 63
          },
          endPosition: {
            line: 5,
            character: 71
          }
       });
    });

    it('should succeed with elementref', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<bar #baz>{{ baz.value }}</bar>'
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
        assertSuccess('no-access-missing-member', source);
    });

    it('should fail with nonexisting @HostBinding', () => {
      let source = `
        import { Directive, HostBinding, Component, NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';

        @Directive({
          selector: '[foo]'
        })
        export class FooDirective {}

        @Component({
          template: \`<div foo [attr.title]="foo"></div>\`
        })
        export class Test {
        }
        
        @NgModule({
          imports: [CommonModule],
          declarations: [Test, FooDirective],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The property "foo" that you\'re trying to access does not exist in the class declaration.',
          startPosition: {
            line: 10,
            character: 44
          },
          endPosition: {
            line: 10,
            character: 47
          }
       });
    });

  });

  describe('valid expressions', () => {
    it('should succeed with "ngForm" ref', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';
        import { FormsModule } from '@angular/forms';

        @Component({
          selector: 'foobar',
          template: '<form #todoForm="ngForm"><button [disabled]="!todoForm.form.valid"></button></form>'
        })
        export class Test {
          foo: number;
        }
        
        @NgModule({
          imports: [FormsModule, CommonModule],
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should support custom template refs', () => {
      let source = `
        import { Component, Directive, NgModule } from '@angular/core';

        @Directive({
          selector: 'bar',
          exportAs: 'baz'
        })
        export class Dir {}

        @Component({
          selector: 'foobar',
          template: '<bar #todoForm="baz"><button [disabled]="!todoForm.form.valid"></button></bar>'
        })
        export class Test {
          foo: number;
        }
        
        @NgModule({
          declarations: [Test, Dir],
          exports: [Test, Dir]
        })
        export class MainModule {}
        `;
        Config.predefinedDirectives.push({
          selector: 'bar',
          exportAs: 'baz'
        });
        assertSuccess('no-access-missing-member', source);
        Config.predefinedDirectives.pop();
    });

    it('should succeed with inline property declaration', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

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
        assertSuccess('no-access-missing-member', source);
    });

    it('should succeed with declared property', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>'
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
        assertSuccess('no-access-missing-member', source);
    });

    it('should succeed on declared method', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo() }}</div>'
        })
        export class Test {
          foo() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should succeed with existing @HostBinding', () => {
      let source = `
        import { Directive, HostBinding, Component, NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';

        @Directive({
          selector: '[foo]',
          host: {
            '[attr.title]': 'foo'
          }
        })
        export class FooDirective {
          foo = 42;
        }

        @Component({
          template: \`<div foo [attr.title]="foo"></div>\`
        })
        export class Test {
        }
        
        @NgModule({
          imports: [CommonModule],
          declarations: [Test, FooDirective],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should succeed with existing @HostBinding', () => {
      let source = `
        import { Directive, HostBinding, Component, NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';

        @Directive({
          selector: '[foo]',
          host: {
            '[attr.title]': 'foo.bar'
          }
        })
        export class FooDirective {
          foo = {
            bar: 42
          };
        }

        @Component({
          template: \`<div foo [attr.title]="foo"></div>\`
        })
        export class Test {
        }
        
        @NgModule({
          imports: [CommonModule],
          declarations: [Test, FooDirective],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should succeed with existing @HostBinding', () => {
      let source = `
        import { Directive, HostBinding, Component, NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';

        @Directive({
          selector: '[foo]'
        })
        export class FooDirective {
          @HostBinding('attr.title') foo = 42;
        }

        @Component({
          template: \`<div foo [attr.title]="foo"></div>\`
        })
        export class Test {
        }
        
        @NgModule({
          imports: [CommonModule],
          declarations: [Test, FooDirective],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

  });

  describe('nested properties and pipes', () => {
    it('should work with existing single-level nested properties', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo.bar }}</div>'
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
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with existing single-level non-existing nested properties', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo.bar }}</div>'
        })
        export class Test {
          foo1 = {};
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The property "foo" that you\'re trying to access does not exist in the class declaration. Probably you mean: "foo1".',
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

    it('should work with existing properties and pipes', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo | baz }}</div>'
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
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with existing properties and pipes', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: '<div>{{ foo.baz() }}</div>'
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
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with existing properties and pipes', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: \`<div class="{{ showMenu ? '' : 'pure-hidden-sm' }}"></div>\`
        })
        export class Test {
          showMenu = {};
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with inputs with string values', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: \`
            <form>
              <input type="submit" [hidden]="hasOrdered" class="btn-menu" value="Order">
              <button [hidden]="!hasOrdered" class="bnt-red">Already ordered</button>
            </form>
            \`
        })
        export class Test {
          public hasOrdered: boolean;
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with getters', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: \`{{ bar }}\`
        })
        export class Test {
          get bar() {
            return 42;
          }
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with setters', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          selector: 'foobar',
          template: \`<div (click)="bar = 42"></div>\`
        })
        export class Test {
          set bar() {
          }
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

//    it('should work with getters', () => {
//      let source = `
//        @Component({
//          template: \`<form #loginForm="ngForm">
//            <button type="submit" [disabled]="!loginForm.valid"></button>
//          </form>\`
//        })
//        class Test {
//          set bar() {
//          }
//        }`;
//        assertSuccess('no-access-missing-member', source);
//    });

    it('should work with getters', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          template: \`
          <ul>
            <li *ngFor="let bar of foo">{{ bar }}</li>
          </ul>
            \`
        })
        export class Test {
          foo = [];
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });


    it('should work with local template variables', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          template: \`
          <ul>
            <li (click)="$event.stopPropagation()"></li>
          </ul>
            \`
        })
        export class Test {
          handler() {}
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with array element access', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          template: '{{ names[0].firstName }}'
        })
        export class Test {
          get names() {
            return [{ firstName: 'foo' }];
          }
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should fail with array element access', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          template: '{{t.errorData.errorMessages[0].message}}'
        })
        export class Test {
          get names() {
            return [{ firstName: 'foo' }];
          }
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The property "t" that you\'re trying to access does not exist in the class declaration.',
          startPosition: {
            line: 4,
            character: 23
          },
          endPosition: {
            line: 4,
            character: 24
          }
        });
    });

    it('should fail with array element access', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          template: '{{t.errorData[0].errorMessages.message}}'
        })
        export class Test {
          get names() {
            return [{ firstName: 'foo' }];
          }
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The property "t" that you\'re trying to access does not exist in the class declaration.',
          startPosition: {
            line: 4,
            character: 23
          },
          endPosition: {
            line: 4,
            character: 24
          }
        });
    });

    it('should succeed with array element access', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        @Component({
          template: '{{t.errorData[0].errorMessages.message}}'
        })
        export class Test {
          get t() {
            return [{ firstName: 'foo' }];
          }
        }
        
        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should succeed with array element access', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';

        @Component({
          template: '<div *ngIf="context"></div>'
        })
        export class Test {}
        
        @NgModule({
          imports: [CommonModule],
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The property "context" that you\'re trying to access does not exist in the class declaration.',
          startPosition: {
            line: 5,
            character: 21
          },
          endPosition: {
            line: 5,
            character: 28
          }
        });
    });

    it('should succeed with array element access', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';

        @Component({
          template: \`<div *ngSwitch="context">
              <span *ngSwitchCase="context"></span>
            </div>\`
        })
        export class Test {
        }
        
        @NgModule({
          imports: [CommonModule],
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertFailure('no-access-missing-member', source, {
          message: 'The property "context" that you\'re trying to access does not exist in the class declaration.',
          startPosition: {
            line: 5,
            character: 21
          },
          endPosition: {
            line: 5,
            character: 28
          }
        });
    });

//    TODO
//    it('should work with getters', () => {
//      let source = `
//        @Component({
//          selector: 'foobar',
//          template: \`<div (click)="bar = 42"></div>\`
//        })
//        class Test {
//          get bar() {
//          }
//        }`;
//        assertFailure('no-access-missing-member', source, {
//          message: 'The property "bar" that you\'re trying to access does not exist in the class declaration.',
//          startPosition: {
//            line: 4,
//            character: 29
//          },
//          endPosition: {
//            line: 4,
//            character: 32
//          }
//       });
//    });
  });

  describe('extended classes', () => {
    it('should consider the properties of base classes', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        export class Base {
          foo: boolean;
        }

        @Component({
          template: '{{foo}}'
        })
        export class Test extends Base {}

        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should support deeper inheritance chain', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        export class Baz {
          baz = 42;
        }

        export class Base extends Baz {
          foo: boolean;
        }

        @Component({
          template: '{{baz}}'
        })
        export class Test extends Base {}

        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });

    it('should support property overrides', () => {
      let source = `
        import { Component, NgModule } from '@angular/core';

        export class Baz {
          baz = 42;
        }

        export class Base extends Baz {
          foo: boolean;
        }

        @Component({
          template: '{{baz}}'
        })
        export class Test extends Base {
          baz = 12;
        }

        @NgModule({
          declarations: [Test],
          exports: [Test]
        })
        export class MainModule {}
        `;
        assertSuccess('no-access-missing-member', source);
    });
  });
});
