import { getFailureMessage, Rule } from '../src/contextualDecoratorRule';
import { AngularClassDecorators } from '../src/util/utils';
import { assertAnnotated, assertMultipleAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    describe('Injectable', () => {
      describe('accessors', () => {
        it('should fail if getter accessor is decorated with @Input() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              @Input()
              ~~~~~~~~
              get label(): string {
                return this._label;
              }
              set label(value: string) {
                this._label = value;
              }
              private _label: string;
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Injectable,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if setter accessor is decorated with @Input() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              @Input()
              ~~~~~~~~
              set label(value: string) {
                this._label = value;
              }
              get label(): string {
                return this._label;
              }
              private _label: string;
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Injectable,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if setter accessor is decorated with @ViewChild() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              @ViewChild(Pane)
              ~~~~~~~~~~~~~~~~
              set label(value: Pane) {
                doSomething();
              }
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Injectable,
            }),
            ruleName,
            source,
          });
        });
      });

      describe('methods', () => {
        it('should fail if a method is decorated with @HostListener() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              @HostListener('mouseover')
              ~~~~~~~~~~~~~~~~~~~~~~~~~~
              mouseOver() {
                this.doSomething();
              }
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Injectable,
            }),
            ruleName,
            source,
          });
        });
      });

      describe('parameter properties', () => {
        it('should fail if a parameter property is decorated with @Attribute() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              constructor(
                @Attribute('test') private readonly test: string
                ~~~~~~~~~~~~~~~~~~
              ) {}
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Injectable,
            }),
            ruleName,
            source,
          });
        });
      });

      describe('properties', () => {
        it('should fail if a property is decorated with @ContentChild() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              @ContentChild(Pane) pane: Pane;
              ~~~~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Injectable,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @ContentChildren() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Injectable,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @HostBinding() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              @HostBinding('class.card-outline') private isCardOutline: boolean;
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Injectable,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @Input() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              @Input() label: string;
              ~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Injectable,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @Output() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              @Output() emitter = new EventEmitter<void>();
              ~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Injectable,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @ViewChild() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              @ViewChild(Pane) pane: Pane;
              ~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Injectable,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @ViewChildren() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              @ViewChildren(Pane) panes: QueryList<Pane>;
              ~~~~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Injectable,
            }),
            ruleName,
            source,
          });
        });
      });

      describe('multiple declarations', () => {
        it('should fail if declarations are decorated with non allowed decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              @ContentChild(Pane) pane: Pane;
              ~~~~~~~~~~~~~~~~~~~

              @Input()
              ^^^^^^^^
              get label(): string {
                return this._label;
              }
              set label(value: string) {
                this._label = value;
              }
              private _label: string;

              @ViewChild(Pane)
              ################
              set label(value: Pane) {
                doSomething();
              }

              get type(): string {
                return this._type;
              }
              set type(value: string) {
                this._type = value;
              }
              private _type: string;

              private prop: string | undefined;

              constructor(
                @Attribute('test') private readonly test: string,
                %%%%%%%%%%%%%%%%%%
                @Inject(LOCALE_ID) localeId: string
              ) {}

              @HostListener('mouseover')
              ¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶
              mouseOver() {
                this.doSomething();
              }

              clickHandler(): void {}
            }
          `;
          const msg = getFailureMessage({
            classDecoratorName: AngularClassDecorators.Injectable,
          });
          const failures = [
            {
              char: '~',
              msg,
            },
            {
              char: '^',
              msg,
            },
            {
              char: '#',
              msg,
            },
            {
              char: '%',
              msg,
            },
            {
              char: '¶',
              msg,
            },
          ];
          assertMultipleAnnotated({
            failures,
            ruleName,
            source,
          });
        });
      });
    });

    describe('NgModule', () => {
      describe('accessors', () => {
        it('should fail if getter accessor is decorated with @Input() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              @Input()
              ~~~~~~~~
              get label(): string {
                return this._label;
              }
              set label(value: string) {
                this._label = value;
              }
              private _label: string;
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.NgModule,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if setter accessor is decorated with @Input() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              @Input()
              ~~~~~~~~
              set label(value: string) {
                this._label = value;
              }
              get label(): string {
                return this._label;
              }
              private _label: string;
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.NgModule,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if setter accessor is decorated with @ViewChild() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              @ViewChild(Pane)
              ~~~~~~~~~~~~~~~~
              set label(value: Pane) {
                doSomething();
              }
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.NgModule,
            }),
            ruleName,
            source,
          });
        });
      });

      describe('methods', () => {
        it('should fail if a method is decorated with @HostListener() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              @HostListener('mouseover')
              ~~~~~~~~~~~~~~~~~~~~~~~~~~
              mouseOver() {
                this.doSomething();
              }
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.NgModule,
            }),
            ruleName,
            source,
          });
        });
      });

      describe('parameter properties', () => {
        it('should fail if a parameter property is decorated with @Attribute() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              constructor(
                @Attribute('test') private readonly test: string
                ~~~~~~~~~~~~~~~~~~
              ) {}
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.NgModule,
            }),
            ruleName,
            source,
          });
        });
      });

      describe('properties', () => {
        it('should fail if a property is decorated with @ContentChild() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              @ContentChild(Pane) pane: Pane;
              ~~~~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.NgModule,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @ContentChildren() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.NgModule,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @HostBinding() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              @HostBinding('class.card-outline') private isCardOutline: boolean;
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.NgModule,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @Input() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              @Input() label: string;
              ~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.NgModule,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @Output() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              @Output() emitter = new EventEmitter<void>();
              ~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.NgModule,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @ViewChild() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              @ViewChild(Pane) pane: Pane;
              ~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.NgModule,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @ViewChildren() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              @ViewChildren(Pane) panes: QueryList<Pane>;
              ~~~~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.NgModule,
            }),
            ruleName,
            source,
          });
        });
      });

      describe('multiple declarations', () => {
        it('should fail if declarations are decorated with non allowed decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              @ContentChild(Pane) pane: Pane;
              ~~~~~~~~~~~~~~~~~~~

              @Input()
              ^^^^^^^^
              get label(): string {
                return this._label;
              }
              set label(value: string) {
                this._label = value;
              }
              private _label: string;

              @ViewChild(Pane)
              ################
              set label(value: Pane) {
                doSomething();
              }

              get type(): string {
                return this._type;
              }
              set type(value: string) {
                this._type = value;
              }
              private _type: string;

              private prop: string | undefined;

              constructor(
                @Attribute('test') private readonly test: string,
                %%%%%%%%%%%%%%%%%%
                @Inject(LOCALE_ID) localeId: string
              ) {}

              @HostListener('mouseover')
              ¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶
              mouseOver() {
                this.doSomething();
              }

              clickHandler(): void {}
            }
          `;
          const msg = getFailureMessage({
            classDecoratorName: AngularClassDecorators.NgModule,
          });
          const failures = [
            {
              char: '~',
              msg,
            },
            {
              char: '^',
              msg,
            },
            {
              char: '#',
              msg,
            },
            {
              char: '%',
              msg,
            },
            {
              char: '¶',
              msg,
            },
          ];
          assertMultipleAnnotated({
            failures,
            ruleName,
            source,
          });
        });
      });
    });

    describe('Pipe', () => {
      describe('accessors', () => {
        it('should fail if getter accessor is decorated with @Input() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              @Input()
              ~~~~~~~~
              get label(): string {
                return this._label;
              }
              set label(value: string) {
                this._label = value;
              }
              private _label: string;
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Pipe,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if setter accessor is decorated with @Input() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              @Input()
              ~~~~~~~~
              set label(value: string) {
                this._label = value;
              }
              get label(): string {
                return this._label;
              }
              private _label: string;
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Pipe,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if setter accessor is decorated with @ViewChild() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              @ViewChild(Pane)
              ~~~~~~~~~~~~~~~~
              set label(value: Pane) {
                doSomething();
              }
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Pipe,
            }),
            ruleName,
            source,
          });
        });
      });

      describe('methods', () => {
        it('should fail if a method is decorated with @HostListener() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              @HostListener('mouseover')
              ~~~~~~~~~~~~~~~~~~~~~~~~~~
              mouseOver() {
                this.doSomething();
              }
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Pipe,
            }),
            ruleName,
            source,
          });
        });
      });

      describe('parameter properties', () => {
        it('should fail if a parameter property is decorated with @Attribute() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              constructor(
                @Attribute('test') private readonly test: string
                ~~~~~~~~~~~~~~~~~~
              ) {}
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Pipe,
            }),
            ruleName,
            source,
          });
        });
      });

      describe('properties', () => {
        it('should fail if a property is decorated with @ContentChild() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              @ContentChild(Pane) pane: Pane;
              ~~~~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Pipe,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @ContentChildren() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Pipe,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @HostBinding() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              @HostBinding('class.card-outline') private isCardOutline: boolean;
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Pipe,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @Input() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              @Input() label: string;
              ~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Pipe,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @Output() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              @Output() emitter = new EventEmitter<void>();
              ~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Pipe,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @ViewChild() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              @ViewChild(Pane) pane: Pane;
              ~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Pipe,
            }),
            ruleName,
            source,
          });
        });

        it('should fail if a property is decorated with @ViewChildren() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              @ViewChildren(Pane) panes: QueryList<Pane>;
              ~~~~~~~~~~~~~~~~~~~
            }
          `;
          assertAnnotated({
            message: getFailureMessage({
              classDecoratorName: AngularClassDecorators.Pipe,
            }),
            ruleName,
            source,
          });
        });
      });

      describe('multiple declarations', () => {
        it('should fail if declarations are decorated with non allowed decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              @ContentChild(Pane) pane: Pane;
              ~~~~~~~~~~~~~~~~~~~

              @Input()
              ^^^^^^^^
              get label(): string {
                return this._label;
              }
              set label(value: string) {
                this._label = value;
              }
              private _label: string;

              @ViewChild(Pane)
              ################
              set label(value: Pane) {
                doSomething();
              }

              get type(): string {
                return this._type;
              }
              set type(value: string) {
                this._type = value;
              }
              private _type: string;

              private prop: string | undefined;

              constructor(
                @Attribute('test') private readonly test: string,
                %%%%%%%%%%%%%%%%%%
                @Inject(LOCALE_ID) localeId: string
              ) {}

              @HostListener('mouseover')
              ¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶
              mouseOver() {
                this.doSomething();
              }

              clickHandler(): void {}
            }
          `;
          const msg = getFailureMessage({
            classDecoratorName: AngularClassDecorators.Pipe,
          });
          const failures = [
            {
              char: '~',
              msg,
            },
            {
              char: '^',
              msg,
            },
            {
              char: '#',
              msg,
            },
            {
              char: '%',
              msg,
            },
            {
              char: '¶',
              msg,
            },
          ];
          assertMultipleAnnotated({
            failures,
            ruleName,
            source,
          });
        });
      });
    });

    describe('multiple decorators per file', () => {
      it('should fail if contains @Directive and @Pipe decorators and the @Pipe contains a not allowed decorator', () => {
        const source = `
          @Directive({
            selector: 'test'
          })
          class TestDirective {
            @Input() label: string;
          }

          @Pipe({
            name: 'test'
          })
          class Test {
            @Input() label: string;
            ~~~~~~~~
          }
        `;
        const message = getFailureMessage({
          classDecoratorName: AngularClassDecorators.Pipe,
        });
        assertAnnotated({
          message,
          ruleName,
          source,
        });
      });
    });
  });

  describe('success', () => {
    describe('Component', () => {
      describe('accessors', () => {
        it('should succeed if getter accessor is decorated with @Input() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              @Input()
              get label(): string {
                return this._label;
              }
              set label(value: string) {
                this._label = value;
              }
              private _label: string;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if setter accessor is decorated with @Input() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              @Input()
              set label(value: string) {
                this._label = value;
              }
              get label(): string {
                return this._label;
              }
              private _label: string;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if setter accessor is decorated with @ViewChild() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              @ViewChild(Pane)
              set label(value: Pane) {
                doSomething();
              }
            }
          `;
          assertSuccess(ruleName, source);
        });
      });

      describe('methods', () => {
        it('should succeed if a method is decorated with @HostListener() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              @HostListener('mouseover')
              mouseOver() {
                this.doSomething();
              }
            }
          `;
          assertSuccess(ruleName, source);
        });
      });

      describe('parameter properties', () => {
        it('should succeed if a parameter property is decorated with @Host() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              constructor(
                @Host() private readonly host: DynamicHost
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Inject() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              constructor(
                @Inject(LOCALE_ID) private readonly localeId: string
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Optional() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              constructor(
                @Optional() testBase: TestBase,
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Self() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              constructor(
                @Self() public readonly test: Test,
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @SkipSelf() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              constructor(
                @SkipSelf() protected readonly parentTest: ParentTest
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });
      });

      describe('properties', () => {
        it('should succeed if a property is decorated with @ContentChild() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              @ContentChild(Pane) pane: Pane;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a property is decorated with @ContentChildren() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a property is decorated with @HostBinding() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              @HostBinding('class.card-outline') private isCardOutline: boolean;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a property is decorated with @Input() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              @Input() label: string;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a property is decorated with @Output() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              @Output() emitter = new EventEmitter<void>();
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a property is decorated with @ViewChild() decorator', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
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
            @Component({
              template: 'Hi!'
            })
            class Test {
              @ViewChildren(Pane) panes: QueryList<Pane>;
            }
          `;
          assertSuccess(ruleName, source);
        });
      });

      describe('multiple declarations', () => {
        it('should succeed if declarations are decorated with allowed decorators', () => {
          const source = `
            @Component({
              template: 'Hi!'
            })
            class Test {
              @ContentChild(Pane) pane: Pane;

              @Input()
              get label(): string {
                return this._label;
              }
              set label(value: string) {
                this._label = value;
              }
              private _label: string;

              @ViewChild(Pane)
              set label(value: Pane) {
                doSomething();
              }

              get type(): string {
                return this._type;
              }
              set type(value: string) {
                this._type = value;
              }
              private _type: string;

              private prop: string | undefined;

              constructor(
                @Attribute('test') private readonly test: string,
                @Host() @Optional() private readonly host: DynamicHost,
                @Inject(LOCALE_ID) private readonly localeId: string,
                @Inject(TEST_BASE) @Optional() testBase: TestBase,
                @Optional() @Self() public readonly test: Test,
                @Optional() @SkipSelf() protected readonly parentTest: ParentTest
              ) {}

              @HostListener('mouseover')
              mouseOver(): void {
                this.doSomething();
              }

              clickHandler(): void {}
            }
          `;
          assertSuccess(ruleName, source);
        });
      });
    });

    describe('Directive', () => {
      describe('accessors', () => {
        it('should succeed if getter accessor is decorated with @Input() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              @Input()
              get label(): string {
                return this._label;
              }
              set label(value: string) {
                this._label = value;
              }
              private _label: string;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if setter accessor is decorated with @Input() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              @Input()
              set label(value: string) {
                this._label = value;
              }
              get label(): string {
                return this._label;
              }
              private _label: string;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if setter accessor is decorated with @ViewChild() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              @ViewChild(Pane)
              set label(value: Pane) {
                doSomething();
              }
            }
          `;
          assertSuccess(ruleName, source);
        });
      });

      describe('methods', () => {
        it('should succeed if a method is decorated with @HostListener() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              @HostListener('mouseover')
              mouseOver() {
                this.doSomething();
              }
            }
          `;
          assertSuccess(ruleName, source);
        });
      });

      describe('parameter properties', () => {
        it('should succeed if a parameter property is decorated with @Host() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              constructor(
                @Host() private readonly host: DynamicHost
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Inject() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              constructor(
                @Inject(LOCALE_ID) private readonly localeId: string
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Optional() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              constructor(
                @Optional() testBase: TestBase,
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Self() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              constructor(
                @Self() public readonly test: Test,
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @SkipSelf() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              constructor(
                @SkipSelf() protected readonly parentTest: ParentTest
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });
      });

      describe('properties', () => {
        it('should succeed if a property is decorated with @ContentChild() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              @ContentChild(Pane) pane: Pane;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a property is decorated with @ContentChildren() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a property is decorated with @HostBinding() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              @HostBinding('class.card-outline') private isCardOutline: boolean;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a property is decorated with @Input() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              @Input() label: string;
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a property is decorated with @Output() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              @Output() emitter = new EventEmitter<void>();
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a property is decorated with @ViewChild() decorator', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
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
            @Directive({
              selector: 'test'
            })
            class Test {
              @ViewChildren(Pane) panes: QueryList<Pane>;
            }
          `;
          assertSuccess(ruleName, source);
        });
      });

      describe('multiple declarations', () => {
        it('should succeed if declarations are decorated with allowed decorators', () => {
          const source = `
            @Directive({
              selector: 'test'
            })
            class Test {
              @ContentChild(Pane) pane: Pane;

              @Input()
              get label(): string {
                return this._label;
              }
              set label(value: string) {
                this._label = value;
              }
              private _label: string;

              @ViewChild(Pane)
              set label(value: Pane) {
                doSomething();
              }

              get type(): string {
                return this._type;
              }
              set type(value: string) {
                this._type = value;
              }
              private _type: string;

              private prop: string | undefined;

              constructor(
                @Attribute('test') private readonly test: string,
                @Host() @Optional() private readonly host: DynamicHost,
                @Inject(LOCALE_ID) private readonly localeId: string,
                @Inject(TEST_BASE) @Optional() testBase: TestBase,
                @Optional() @Self() public readonly test: Test,
                @Optional() @SkipSelf() protected readonly parentTest: ParentTest
              ) {}

              @HostListener('mouseover')
              mouseOver(): void {
                this.doSomething();
              }

              clickHandler(): void {}
            }
          `;
          assertSuccess(ruleName, source);
        });
      });
    });

    describe('Injectable', () => {
      describe('parameter properties', () => {
        it('should succeed if a parameter property is decorated with @Host() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              constructor(
                @Host() private readonly host: DynamicHost
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Inject() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              constructor(
                @Inject(LOCALE_ID) private readonly localeId: string
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Optional() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              constructor(
                @Optional() testBase: TestBase,
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Self() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              constructor(
                @Self() public readonly test: Test,
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @SkipSelf() decorator', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              constructor(
                @SkipSelf() protected readonly parentTest: ParentTest
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });
      });

      describe('multiple declarations', () => {
        it('should succeed if declarations are decorated with allowed decorators', () => {
          const source = `
            @Injectable({
              providedIn: 'root'
            })
            class Test {
              get type(): string {
                return this._type;
              }
              set type(value: string) {
                this._type = value;
              }
              private _type: string;

              private prop: string | undefined;

              constructor(
                @Host() @Optional() private readonly host: DynamicHost,
                @Inject(LOCALE_ID) private readonly localeId: string,
                @Inject(TEST_BASE) @Optional() testBase: TestBase,
                @Optional() @Self() public readonly test: Test,
                @Optional() @SkipSelf() protected readonly parentTest: ParentTest
              ) {}

              clickHandler(): void {}
            }
          `;
          assertSuccess(ruleName, source);
        });
      });
    });

    describe('NgModule', () => {
      describe('parameter properties', () => {
        it('should succeed if a parameter property is decorated with @Host() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              constructor(
                @Host() private readonly host: DynamicHost
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Inject() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              constructor(
                @Inject(LOCALE_ID) private readonly localeId: string
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Optional() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              constructor(
                @Optional() testBase: TestBase,
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Self() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              constructor(
                @Self() public readonly test: Test,
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @SkipSelf() decorator', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              constructor(
                @SkipSelf() protected readonly parentTest: ParentTest
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });
      });

      describe('multiple declarations', () => {
        it('should succeed if declarations are decorated with allowed decorators', () => {
          const source = `
            @NgModule({
              providers: []
            })
            class Test {
              get type(): string {
                return this._type;
              }
              set type(value: string) {
                this._type = value;
              }
              private _type: string;

              private prop: string | undefined;

              constructor(
                @Host() @Optional() private readonly host: DynamicHost,
                @Inject(LOCALE_ID) private readonly localeId: string,
                @Inject(TEST_BASE) @Optional() testBase: TestBase,
                @Optional() @Self() public readonly test: Test,
                @Optional() @SkipSelf() protected readonly parentTest: ParentTest
              ) {}

              clickHandler(): void {}
            }
          `;
          assertSuccess(ruleName, source);
        });
      });
    });

    describe('Pipe', () => {
      describe('parameter properties', () => {
        it('should succeed if a parameter property is decorated with @Host() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              constructor(
                @Host() private readonly host: DynamicHost
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Inject() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              constructor(
                @Inject(LOCALE_ID) private readonly localeId: string
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Optional() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              constructor(
                @Optional() testBase: TestBase,
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @Self() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              constructor(
                @Self() public readonly test: Test,
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed if a parameter property is decorated with @SkipSelf() decorator', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              constructor(
                @SkipSelf() protected readonly parentTest: ParentTest
              ) {}
            }
          `;
          assertSuccess(ruleName, source);
        });
      });

      describe('multiple declarations', () => {
        it('should succeed if declarations are decorated with allowed decorators', () => {
          const source = `
            @Pipe({
              name: 'test'
            })
            class Test {
              get type(): string {
                return this._type;
              }
              set type(value: string) {
                this._type = value;
              }
              private _type: string;

              private prop: string | undefined;

              constructor(
                @Host() @Optional() private readonly host: DynamicHost,
                @Inject(LOCALE_ID) private readonly localeId: string,
                @Inject(TEST_BASE) @Optional() testBase: TestBase,
                @Optional() @Self() public readonly test: Test,
                @Optional() @SkipSelf() protected readonly parentTest: ParentTest
              ) {}

              clickHandler(): void {}
            }
          `;
          assertSuccess(ruleName, source);
        });
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
