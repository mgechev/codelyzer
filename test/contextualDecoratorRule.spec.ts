import { getFailureMessage, Rule } from '../src/contextualDecoratorRule';
import { AngularClassDecorators, AngularInnerClassDecorators } from '../src/util/utils';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    describe('Injectable', () => {
      it('should fail if a property is decorated with @ContentChild() decorator', () => {
        const source = `
          @Injectable()
          class Test {
            @ContentChild(Pane) pane: Pane;
            ~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Injectable,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.ContentChild
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @ContentChildren() decorator', () => {
        const source = `
          @Injectable()
          class Test {
            @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Injectable,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.ContentChildren
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @HostBinding() decorator', () => {
        const source = `
          @Injectable()
          class Test {
            @HostBinding('class.card-outline') private isCardOutline: boolean;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Injectable,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.HostBinding
          }),
          ruleName,
          source
        });
      });

      it('should fail if a method is decorated with @HostListener() decorator', () => {
        const source = `
          @Injectable()
          class Test {
            @HostListener('mouseover')
            ~~~~~~~~~~~~~~~~~~~~~~~~~~
            mouseOver() {
              console.log('mouseOver');
            }
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Injectable,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.HostListener
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @Input() decorator', () => {
        const source = `
          @Injectable()
          class Test {
            @Input() label: string;
            ~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Injectable,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.Input
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @Output() decorator', () => {
        const source = `
          @Injectable()
          class Test {
            @Output() emitter = new EventEmitter<void>();
            ~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Injectable,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.Output
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @ViewChild() decorator', () => {
        const source = `
          @Injectable()
          class Test {
            @ViewChild(Pane) pane: Pane;
            ~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Injectable,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.ViewChild
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @ViewChildren() decorator', () => {
        const source = `
          @Injectable()
          class Test {
            @ViewChildren(Pane) panes: QueryList<Pane>;
            ~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Injectable,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.ViewChildren
          }),
          ruleName,
          source
        });
      });
    });

    describe('NgModule', () => {
      it('should fail if a property is decorated with @ContentChild() decorator', () => {
        const source = `
          @NgModule()
          class Test {
            @ContentChild(Pane) pane: Pane;
            ~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.NgModule,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.ContentChild
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @ContentChildren() decorator', () => {
        const source = `
          @NgModule()
          class Test {
            @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.NgModule,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.ContentChildren
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @HostBinding() decorator', () => {
        const source = `
          @NgModule()
          class Test {
            @HostBinding('class.card-outline') private isCardOutline: boolean;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.NgModule,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.HostBinding
          }),
          ruleName,
          source
        });
      });

      it('should fail if a method is decorated with @HostListener() decorator', () => {
        const source = `
          @NgModule()
          class Test {
            @HostListener('mouseover')
            ~~~~~~~~~~~~~~~~~~~~~~~~~~
            mouseOver() {
              console.log('mouseOver');
            }
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.NgModule,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.HostListener
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @Input() decorator', () => {
        const source = `
          @NgModule()
          class Test {
            @Input() label: string;
            ~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.NgModule,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.Input
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @Output() decorator', () => {
        const source = `
          @NgModule()
          class Test {
            @Output() emitter = new EventEmitter<void>();
            ~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.NgModule,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.Output
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @ViewChild() decorator', () => {
        const source = `
          @NgModule()
          class Test {
            @ViewChild(Pane) pane: Pane;
            ~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.NgModule,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.ViewChild
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @ViewChildren() decorator', () => {
        const source = `
          @NgModule()
          class Test {
            @ViewChildren(Pane) panes: QueryList<Pane>;
            ~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.NgModule,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.ViewChildren
          }),
          ruleName,
          source
        });
      });
    });

    describe('Pipe', () => {
      it('should fail if a property is decorated with @ContentChild() decorator', () => {
        const source = `
          @Pipe()
          class Test {
            @ContentChild(Pane) pane: Pane;
            ~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Pipe,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.ContentChild
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @ContentChildren() decorator', () => {
        const source = `
          @Pipe()
          class Test {
            @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Pipe,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.ContentChildren
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @HostBinding() decorator', () => {
        const source = `
          @Pipe()
          class Test {
            @HostBinding('class.card-outline') private isCardOutline: boolean;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Pipe,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.HostBinding
          }),
          ruleName,
          source
        });
      });

      it('should fail if a method is decorated with @HostListener() decorator', () => {
        const source = `
          @Pipe()
          class Test {
            @HostListener('mouseover')
            ~~~~~~~~~~~~~~~~~~~~~~~~~~
            mouseOver() {
              console.log('mouseOver');
            }
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Pipe,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.HostListener
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @Input() decorator', () => {
        const source = `
          @Pipe()
          class Test {
            @Input() label: string;
            ~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Pipe,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.Input
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @Output() decorator', () => {
        const source = `
          @Pipe()
          class Test {
            @Output() emitter = new EventEmitter<void>();
            ~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Pipe,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.Output
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @ViewChild() decorator', () => {
        const source = `
          @Pipe()
          class Test {
            @ViewChild(Pane) pane: Pane;
            ~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Pipe,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.ViewChild
          }),
          ruleName,
          source
        });
      });

      it('should fail if a property is decorated with @ViewChildren() decorator', () => {
        const source = `
          @Pipe()
          class Test {
            @ViewChildren(Pane) panes: QueryList<Pane>;
            ~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          message: getFailureMessage({
            classDecoratorName: AngularClassDecorators.Pipe,
            className: 'Test',
            innerClassDecoratorName: AngularInnerClassDecorators.ViewChildren
          }),
          ruleName,
          source
        });
      });
    });

    describe('multiple decorators per file', () => {
      it('should fail if contains @Directive and @Pipe decorators and the @Pipe contains a not allowed decorator', () => {
        const source = `
          @Directive()
          class TestDirective {
            @Input() label: string;
          }

          @Pipe()
          class Test {
            @Input() label: string;
            ~~~~~~~~
          }
        `;
        const message = getFailureMessage({
          classDecoratorName: AngularClassDecorators.Pipe,
          className: 'Test',
          innerClassDecoratorName: AngularInnerClassDecorators.Input
        });
        assertAnnotated({
          message,
          ruleName,
          source
        });
      });
    });
  });

  describe('success', () => {
    describe('', () => {
      it('should succeed if a property is decorated with @ContentChild() decorator', () => {
        const source = `Component
          @Component()
          class Test {
            @ContentChild(Pane) pane: Pane;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is decorated with @ContentChildren() decorator', () => {
        const source = `
          @Component()
          class Test {
            @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is decorated with @HostBinding() decorator', () => {
        const source = `
          @Component()
          class Test {
            @HostBinding('class.card-outline') private isCardOutline: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a method is decorated with @HostListener() decorator', () => {
        const source = `
          @Component()
          class Test {
            @HostListener('mouseover')
            mouseOver() {
              console.log('mouseOver');
            }
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is decorated with @Input() decorator', () => {
        const source = `
          @Component()
          class Test {
            @Input() label: string;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is decorated with @Output() decorator', () => {
        const source = `
          @Component()
          class Test {
            @Output() emitter = new EventEmitter<void>();
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is decorated with @ViewChild() decorator', () => {
        const source = `
          @Component()
          class Test {
            @ViewChild(Pane)
            set pane(value: Pane) {
              console.log('panel setter called');
            }
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is decorated with @ViewChildren() decorator', () => {
        const source = `
          @Component()
          class Test {
            @ViewChildren(Pane) panes: QueryList<Pane>;
          }
        `;
        assertSuccess(ruleName, source);
      });
    });

    describe('Directive', () => {
      it('should succeed if a property is decorated with @ContentChild() decorator', () => {
        const source = `
          @Directive()
          class Test {
            @ContentChild(Pane) pane: Pane;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is decorated with @ContentChildren() decorator', () => {
        const source = `
          @Directive()
          class Test {
            @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is decorated with @HostBinding() decorator', () => {
        const source = `
          @Directive()
          class Test {
            @HostBinding('class.card-outline') private isCardOutline: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a method is decorated with @HostListener() decorator', () => {
        const source = `
          @Directive()
          class Test {
            @HostListener('mouseover')
            mouseOver() {
              console.log('mouseOver');
            }
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is decorated with @Input() decorator', () => {
        const source = `
          @Directive()
          class Test {
            @Input() label: string;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is decorated with @Output() decorator', () => {
        const source = `
          @Directive()
          class Test {
            @Output() emitter = new EventEmitter<void>();
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is decorated with @ViewChild() decorator', () => {
        const source = `
          @Directive()
          class Test {
            @ViewChild(Pane)
            set pane(value: Pane) {
              console.log('panel setter called');
            }
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is decorated with @ViewChildren() decorator', () => {
        const source = `
          @Directive()
          class Test {
            @ViewChildren(Pane) panes: QueryList<Pane>;
          }
        `;
        assertSuccess(ruleName, source);
      });
    });

    describe('multiple decorators per file', () => {
      it(
        'should succeed if @Component and @Injectable decorators are present on the same file and ' +
          'the @Component contains a non allowed decorator for @Injectable',
        () => {
          const source = `
            @Injectable()
            class TestService {
              constructor() {}
            }

            @Component({
              selector: 'app-test',
              template: '<h1>Hello</h1>',
              providers: [TestService]
            })
            class TestComponent implements OnChanges {
              @Output() emitter = new EventEmitter<void>();

              constructor(private test: TestService) {}
            }
          `;
          assertSuccess(ruleName, source);
        }
      );
    });
  });
});
