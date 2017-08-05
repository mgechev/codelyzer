import { assertSuccess, assertAnnotated } from './testHelper';
import { Config } from '../src/angular/config';

describe('no-access-missing-member', () => {
  describe('invalid expressions', () => {
    it('should fail when interpolating missing property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>'
                             ~~~
        })
        class Test {
          bar: number;
        }`;
        assertAnnotated({
          ruleName: 'no-access-missing-member',
          message: 'The property "foo" that you\'re trying to access does not exist in the class declaration.',
          source
        });
    });

    it('should work with existing properties and pipes', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div class="1 + {{ showMenu ? '' : 'pure-hidden-sm' }})"></div>\`
                                        ~~~~~~~~
        })
        class Test {}`;
        assertAnnotated({
          ruleName: 'no-access-missing-member',
          message: 'The property "showMenu" that you\'re trying to access does not exist in the class declaration.',
          source
        });
    });

    it('should fail when using missing method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ baz() }}</div>
                             ~~~
        })
        class Test {
          bar() {}
        }`;
       assertAnnotated({
         ruleName: 'no-access-missing-member',
         message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
         source
       });
    });

    it('should fail when using missing method in an interpolation mixed with text', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div> test {{ baz() }}</div>
                                   ~~~
        })
        class Test {
          bar() {}
        }`;
        assertAnnotated({
          ruleName: 'no-access-missing-member',
          message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
          source
        });
    });

    it('should fail when using missing method in an interpolation mixed with text and interpolation', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div> test {{ bar() }} {{ baz() }}</div>
                                               ~~~
        })
        class Test {
          bar() {}
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
        source
      });
    });

    it('should fail when using missing method in an interpolation mixed with text, interpolation & binary expression', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div> test {{ bar() }} {{ bar() + baz() }}</div>
                                                       ~~~
        })
        class Test {
          bar() {}
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
        source
      });
    });

    it('should fail in binary operation with missing property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ baz2() + foo }}</div>
                                      ~~~
        })
        class Test {
          baz2() {}
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The property "foo" that you\'re trying to access does not exist in the class declaration.',
        source
      });
    });

    it('should fail in binary operation with missing method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ baz() + getPrsonName(1, 2, 3) }}</div>
                                     ~~~~~~~~~~~~
        })
        class Test {
          baz() {}
          getPersonName() {}
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The method "getPrsonName" that you\'re trying to access does not exist in ' +
        'the class declaration. Probably you mean: "getPersonName".',
        source
      });
    });

    it('should fail with property binding and missing method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div [className]="bar()"></div>
                                       ~~~
        })
        class Test {
          baz() {}
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
        source
      });
    });

    it('should fail with style binding and missing method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div [style.color]="bar()"></div>
                                         ~~~
        })
        class Test {
          baz() {}
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
        source
      });
    });

    it('should fail on event handling with missing method', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div (click)="bar()"></div>
                                   ~~~
        })
        class Test {
          baz() {}
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
        source
      });
    });

    it('should fail on event handling on the right position with a lot of whitespace', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div (click)=   "   bar()"></div>
                                         ~~~
        })
        class Test {
          baz() {}
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
        source
      });
    });

    it('should fail on event handling on the right position with spaces and newlines', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div [class.foo]=   "
            bar()"></div>\`
            ~~~
        })
        class Test {
          baz() {}
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
        source
      });
    });


    it('should not throw when template ref used outside component scope', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<form #todoForm="ngForm"></form><button [disabled]="!todoForm.form.valid"></button>'
        })
        class Test {
          foo: number;
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should not throw when routerLinkActive template ref is used in component', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<a #test="routerLinkActive" [routerLinkActive]="">{{ test }}</a>'
        })
        class Test {}`;
        assertSuccess('no-access-missing-member', source);
    });


    it('should not throw when ngModel template ref is used in component', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<input #test="ngModel" [(ngModel)]="foo">{{ test }}'
        })
        class Test {
          foo: string;
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should not throw when [md-menu-item] template ref is used in component', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div md-menu-item #test="mdMenuItem">{{ test }}</div>'
        })
        class Test {
          foo: string;
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should not throw when md-menu template ref is used in component', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<md-menu #test="mdMenu">{{ test }}</md-menu>'
        })
        class Test {
          foo: string;
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should not throw when md-button-toggle-group template ref is used in component', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<md-button-toggle-group #test="mdButtonToggleGroup">{{ test }}</md-button-toggle-group>'
        })
        class Test {}`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should not throw when md-menu-trigger-for template ref is used in component', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div mdMenuTriggerFor #test="mdMenuTrigger">{{ test }}</div>'
        })
        class Test {}`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should not throw when mdTooltip template ref is used in component', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div mdTooltip #test="mdTooltip">{{ test }}</div>'
        })
        class Test {}`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should not throw when mdSelect template ref is used in component', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<md-select #test="mdSelect">{{ test }}</md-select>'
        })
        class Test {}`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should fail with missing ref', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<bar #todoForm="baz"><button [disabled]="!todoForm.form.valid"></button></bar>'
                                                               ~~~~~~~~
        })
        class Test {
          foo: number;
        }`;
        assertAnnotated({
          ruleName: 'no-access-missing-member',
          message: 'The property "todoForm" that you\'re trying to access does not exist in the class declaration.',
          source
        });
    });

    it('should succeed with elementref', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<bar #baz>{{ baz.value }}</bar>'
        })
        class Test {
          foo: number;
        }`;
        assertSuccess('no-access-missing-member', source);
    });

  });

  describe('valid expressions', () => {
    it('should succeed with "ngForm" ref', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<form #todoForm="ngForm"><button [disabled]="!todoForm.form.valid"></button></form>'
        })
        class Test {
          foo: number;
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should support custom template refs', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<bar #todoForm="baz"><button [disabled]="!todoForm.form.valid"></button></bar>'
        })
        class Test {
          foo: number;
        }`;
        Config.predefinedDirectives.push({
          selector: 'bar',
          exportAs: 'baz'
        });
        assertSuccess('no-access-missing-member', source);
        Config.predefinedDirectives.pop();
    });

    it('should succeed with inline property declaration', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '{{ foo }}'
        })
        class Test {
          constructor(public foo: number) {}
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should succeed with declared property', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>'
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
                             ~~~
        })
        class Test {
          foo1 = {};
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The property "foo" that you\'re trying to access does not exist in the class declaration. Probably you mean: "foo1".',
        source
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

    it('should work with existing properties and pipes', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo.baz() }}</div>
        })
        class Test {
          foo = {};
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with existing properties and pipes', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div class="{{ showMenu ? '' : 'pure-hidden-sm' }}"></div>\`
        })
        class Test {
          showMenu = {};
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with inputs with string values', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`
            <form>
              <input type="submit" [hidden]="hasOrdered" class="btn-menu" value="Order">
              <button [hidden]="!hasOrdered" class="bnt-red">Already ordered</button>
            </form>
            \`
        })
        class Test {
          public hasOrdered: boolean;
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with getters', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`{{ bar }}\`
        })
        class Test {
          get bar() {
            return 42;
          }
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with setters', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div (click)="bar = 42"></div>\`
        })
        class Test {
          set bar() {
          }
        }`;
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
        @Component({
          template: \`
          <ul>
            <li *ngFor="let bar of foo">{{ bar }}</li>
          </ul>
            \`
        })
        class Test {
          foo = [];
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with "as" syntax', () => {
      let source = `
        @Component({
          template: \`
            <ng-container *ngIf="employee$ | async as emp">{{ emp }}</ng-container>
            \`
        })
        class Test {
          employee$;
        }`;
        assertSuccess('no-access-missing-member', source);
    });


    it('should work with local template variables', () => {
      let source = `
        @Component({
          template: \`
          <ul>
            <li (click)="$event.stopPropagation()"></li>
          </ul>
            \`
        })
        class Test {
          handler() {}
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should work with array element access', () => {
      let source = `
        @Component({
          template: '{{ names[0].firstName }}'
        })
        class Test {
          get names() {
            return [{ firstName: 'foo' }];
          }
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should fail with array element access', () => {
      let source = `
        @Component({
          template: '{{t.errorData.errorMessages[0].message}}'
                       ~
        })
        class Test {
          get names() {
            return [{ firstName: 'foo' }];
          }
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The property "t" that you\'re trying to access does not exist in the class declaration.',
        source
      });
    });

    it('should fail with array element access', () => {
      let source = `
        @Component({
          template: '{{t.errorData[0].errorMessages.message}}'
                       ~
        })
        class Test {
          get names() {
            return [{ firstName: 'foo' }];
          }
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The property "t" that you\'re trying to access does not exist in the class declaration.',
        source
      });
    });

    it('should succeed with array element access', () => {
      let source = `
        @Component({
          template: '{{t.errorData[0].errorMessages.message}}'
        })
        class Test {
          get t() {
            return [{ firstName: 'foo' }];
          }
        }`;
        assertSuccess('no-access-missing-member', source);
    });

    it('should succeed with array element access', () => {
      let source = `
        @Component({
          template: \`<div *ngIf="context"></div>
                                 ~~~~~~~
          \`
        })
        class Test {
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The property "context" that you\'re trying to access does not exist in the class declaration.',
        source
      });
    });


    it('should succeed with array element access', () => {
      let source = `
        @Component({
          template: \`<div *ngSwitch="context">
                                     ~~~~~~~
              <span *ngSwitchCase="bar"></span>
            </div>\`
        })
        class Test {
        }`;
      assertAnnotated({
        ruleName: 'no-access-missing-member',
        message: 'The property "context" that you\'re trying to access does not exist in the class declaration.',
        source
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
//            line: 3,
//            character: 29
//          },
//          endPosition: {
//            line: 3,
//            character: 32
//          }
//       });
//    });
  });
});
