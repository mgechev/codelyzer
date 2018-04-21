import { assertAnnotated, assertFailures, assertSuccess } from './testHelper';

describe('decorator-not-allowed', () => {
  describe('success', () => {
    describe('valid directive class', () => {
      it('should succeed when is used @Injectable decorator', () => {
        let source = `
          @Directive()
          class TestDirective {
            @Input() label: string
          }
        `;
        assertSuccess('decorator-not-allowed', source);
      });
    });

    describe('valid directive class', () => {
      it('should succeed when is used @Injectable decorator', () => {
        let source = `
          @Directive()
          class TestDirective {
            @Output('change') change = new EventEmitter<any>();
          }
        `;
        assertSuccess('decorator-not-allowed', source);
      });
    });

    describe('valid directive class', () => {
      it('should succeed when is used @Injectable decorator', () => {
        let source = `
          @Directive()
          class TestDirective {
            @HostBinding('style.backgroundColor') color = "red";
            @HostListener('mouseenter') onEnter() {
              this.color= "blue" ;
            }
          }
        `;
        assertSuccess('decorator-not-allowed', source);
      });
    });

    describe('valid directive class', () => {
      it('should succeed when is used @Injectable decorator', () => {
        let source = `
          @Directive()
          class TestDirective {
            @ViewChild(ChildDirective) child: ChildDirective;
            @ViewChildren(ChildDirective) viewChildren: QueryList<ChildDirective>;
          }
        `;
        assertSuccess('decorator-not-allowed', source);
      });
    });

    describe('valid service class', () => {
      it('should succeed when is used @Injectable decorator', () => {
        let source = `
          @Directive()
          class TestDirective {
            @ContentChildren(Pane) topLevelPanes: QueryList<Pane>;
            @ContentChild(ChildDirective) contentChild: ChildDirective;
          }
        `;
        assertSuccess('decorator-not-allowed', source);
      });
    });

    describe('valid directive class', () => {
      it('should succeed when is used @Injectable decorator', () => {
        let source = `
          @Directive()
          class TestDirective {
            @HostBinding('style.backgroundColor') color = "red";
            @HostListener('mouseenter') onEnter() {
              this.color= "blue" ;
            }
          }
        `;
        assertSuccess('decorator-not-allowed', source);
      });
    });

    describe('valid directive class', () => {
      it('should succeed when we have an @Injectable than an @Component decorator with an @Input', () => {
        let source = `
          @Injectable()
          class MyService {
          }
          @Component({})
          class MyComponent {
            @Input('attribute') label: string;
          }
        `;
        assertSuccess('decorator-not-allowed', source);
      });
    });
  });

  describe('failure', () => {
    describe('not allowed input property', () => {
      it('should fail, when the class have an @Injectable decorator', () => {
        let source = `
          @Injectable()
          class MyService {
            @Input('attribute') label: string;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          ruleName: 'decorator-not-allowed',
          message:
            'In the class "MyService" which have the "@Injectable" decorator, the ' +
            '"@Input" decorator is not allowed. ' +
            'Please, drop it.',
          source
        });
      });
    });

    describe('not allowed output property', () => {
      it('should fail, when the class have an @Injectable decorator', () => {
        let source = `
          @Injectable()
          class MyService {
            @Output('change') change = new EventEmitter<any>();
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          ruleName: 'decorator-not-allowed',
          message:
            'In the class "MyService" which have the "@Injectable" decorator, the ' +
            '"@Output" decorator is not allowed. ' +
            'Please, drop it.',
          source
        });
      });
    });

    describe('not allowed input and output properties', () => {
      it('should fail, when the class have an @Injectable decorator', () => {
        let source = `
          @Injectable()
          class MyService {
            @Input('attribute') label: string;
            @Output('change') change = new EventEmitter<any>();
          }
        `;
        assertFailures('decorator-not-allowed', source, [
          {
            message:
              'In the class "MyService" which have the "@Injectable" decorator, the ' +
              '"@Input" decorator is not allowed. ' +
              'Please, drop it.',
            startPosition: {
              line: 3,
              character: 12
            },
            endPosition: {
              line: 3,
              character: 46
            }
          },
          {
            message:
              'In the class "MyService" which have the "@Injectable" decorator, the ' +
              '"@Output" decorator is not allowed. ' +
              'Please, drop it.',
            startPosition: {
              line: 4,
              character: 12
            },
            endPosition: {
              line: 4,
              character: 63
            }
          }
        ]);
      });
    });

    describe('not allowed @HostBinding property', () => {
      it('should fail, when the class have an @Injectable decorator', () => {
        let source = `
          @Injectable()
          class MyService {
            @HostBinding('style.backgroundColor') color = "red";
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          ruleName: 'decorator-not-allowed',
          message:
            'In the class "MyService" which have the "@Injectable" decorator, the ' +
            '"@HostBinding" decorator is not allowed. ' +
            'Please, drop it.',
          source
        });
      });
    });

    describe('not allowed @HostListener property', () => {
      it('should fail, when the class have an @Injectable decorator', () => {
        let source = `
          @Injectable()
          class MyService {
            @HostListener('mouseenter') onEnter() {
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              this.color= "blue" ;
            }
            ~
          }
        `;
        assertAnnotated({
          ruleName: 'decorator-not-allowed',
          message:
            'In the class "MyService" which have the "@Injectable" decorator, the ' +
            '"@HostListener" decorator is not allowed. ' +
            'Please, drop it.',
          source
        });
      });
    });

    describe('not allowed @ViewChild and @ViewChildren properties', () => {
      it('should fail, when the class have an @Injectable decorator', () => {
        let source = `
          @Injectable()
          class MyService {
            @ViewChild(ChildDirective) child: ChildDirective;
            @ViewChildren(ChildDirective) viewChildren: QueryList<ChildDirective>;
          }
        `;
        assertFailures('decorator-not-allowed', source, [
          {
            message:
              'In the class "MyService" which have the "@Injectable" decorator, the ' +
              '"@ViewChild" decorator is not allowed. ' +
              'Please, drop it.',
            startPosition: {
              line: 3,
              character: 12
            },
            endPosition: {
              line: 3,
              character: 61
            }
          },
          {
            message:
              'In the class "MyService" which have the "@Injectable" decorator, the ' +
              '"@ViewChildren" decorator is not allowed. ' +
              'Please, drop it.',
            startPosition: {
              line: 4,
              character: 12
            },
            endPosition: {
              line: 4,
              character: 82
            }
          }
        ]);
      });
    });

    describe('not allowed @ContentChild and @ContentChildren properties', () => {
      it('should fail, when the class have an @Injectable decorator', () => {
        let source = `
          @Injectable()
          class MyService {
            @ContentChild(ChildDirective) contentChild: ChildDirective;
            @ContentChildren(Pane) topLevelPanes: QueryList<Pane>;
          }
        `;
        assertFailures('decorator-not-allowed', source, [
          {
            message:
              'In the class "MyService" which have the "@Injectable" decorator, the ' +
              '"@ContentChild" decorator is not allowed. ' +
              'Please, drop it.',
            startPosition: {
              line: 3,
              character: 12
            },
            endPosition: {
              line: 3,
              character: 71
            }
          },
          {
            message:
              'In the class "MyService" which have the "@Injectable" decorator, the ' +
              '"@ContentChildren" decorator is not allowed. ' +
              'Please, drop it.',
            startPosition: {
              line: 4,
              character: 12
            },
            endPosition: {
              line: 4,
              character: 66
            }
          }
        ]);
      });
    });
  });
});
