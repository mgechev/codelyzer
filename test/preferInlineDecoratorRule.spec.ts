import { Rule } from '../src/preferInlineDecoratorRule';
import { assertAnnotated, assertFailures, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    describe('getters', () => {
      it('should fail if a getter is not on the same line as its decorator', () => {
        const source = `
          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            ~~~~~~~~
            get test(): string {
              return this._test;
            }
            ~
            private _test: string;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail if a getter is not on the same line as its decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @CustomGetter
            ~~~~~~~~~~~~~
            @Input()
            get test(): string {
              return this._test;
            }
            ~
            set test(value: string) {
              this._test = value;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [
            {
              methods: false,
              'parameter-properties': false,
              parameters: false,
              setters: false,
            },
          ],
          ruleName,
          source,
        });
      });

      it('should fail if a getter is not on the same line as its decorators, which are not on the safelist', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @CustomGetter
            ~~~~~~~~~~~~~
            @Input()
            ~~~~~~~~
            get test(): string {
              return this._test;
            }
            ~
            set test(value: string) {
              this._test = value;
            }
            private _test: string;

            @CustomInput()
            get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @MyCustomDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [
            {
              getters: {
                safelist: ['CustomInput'],
              },
              methods: false,
              'parameter-properties': false,
              parameters: false,
              setters: false,
            },
          ],
          ruleName,
          source,
        });
      });

      it('should fail if multiple getters are not on the same line as their decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            get test(): string {
              return this._test;
            }
            set test(value: string) {
              this._test = value;
            }
            private _test: string;

            @CustomInput()
            get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @Input() set test2(value: string) {
              this._test2 = value;
            }
            private _test2: string;

            @Output()
            private readonly testChange = new EventEmitter<string>();

            @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string, @Inject(Engine) engine: Engine,
                @Attribute('test')
                      testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@Parse
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @CustomCmpDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }

            @NgDecorator()
            @Codelyzer
            handleCustomClick2(): void {
              getValue('custom click 2');
            }
          }
        `;
        assertFailures(
          ruleName,
          source,
          [
            {
              endPosition: {
                character: 13,
                line: 14,
              },
              message: FAILURE_STRING,
              startPosition: {
                character: 12,
                line: 11,
              },
            },
            {
              endPosition: {
                character: 13,
                line: 23,
              },
              message: FAILURE_STRING,
              startPosition: {
                character: 12,
                line: 20,
              },
            },
          ],
          [
            {
              methods: false,
              'parameter-properties': false,
              parameters: false,
              properties: false,
              setters: false,
            },
          ]
        );
      });
    });

    describe('methods', () => {
      it('should fail if a method is not on the same line as its decorator', () => {
        const source = `
          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @HostListener('click')
            ~~~~~~~~~~~~~~~~~~~~~~
            handleClick(): void {
              doSomething('click');
            }
            ~
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail if a method is not on the same line as its decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            ~~~~~~~~~~~~~~~~~~
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }
            ~
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [
            {
              getters: false,
              'parameter-properties': false,
              parameters: false,
              setters: false,
            },
          ],
          ruleName,
          source,
        });
      });

      it('should fail if a method is not on the same line as its decorators, which are not on the safelist', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            ~~~~~~~~~~~~~~~~~~
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }
            ~

            @CmpDecorator
            @MyCustomDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [
            {
              getters: false,
              methods: {
                safelist: ['CmpDecorator'],
              },
              'parameter-properties': false,
              parameters: false,
              setters: false,
            },
          ],
          ruleName,
          source,
        });
      });

      it('should fail if multiple methods are not on the same line as their decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @CustomInput() set test2(value: string) {
              this._test2 = value;
            }
            private _test2: string;

            @Output()
            private readonly testChange = new EventEmitter<string>();

            @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string, @Inject(Engine) engine: Engine,
                @Attribute('test')
                      testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@Parse
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator @CustomCmpDecorator handleCustomClick(): void {
              getValue('custom click');
            }

            @NgDecorator()
            @Codelyzer
            handleCustomClick2(): void {
              getValue('custom click 2');
            }
          }
        `;
        assertFailures(
          ruleName,
          source,
          [
            {
              endPosition: {
                character: 13,
                line: 59,
              },
              message: FAILURE_STRING,
              startPosition: {
                character: 12,
                line: 55,
              },
            },
            {
              endPosition: {
                character: 13,
                line: 69,
              },
              message: FAILURE_STRING,
              startPosition: {
                character: 12,
                line: 65,
              },
            },
          ],
          [
            {
              getters: false,
              'parameter-properties': false,
              parameters: false,
              properties: false,
              setters: false,
            },
          ]
        );
      });
    });

    describe('parameter-properties', () => {
      it('should fail if a parameter property is not on the same line as its decorator', () => {
        const source = `
          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            constructor(@Attribute('label')
                        ~~~~~~~~~~~~~~~~~~~
                private label: string) {}
                                    ~
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail if a parameter property is not on the same line as its decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                private label: string) {}
                                    ~

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [
            {
              getters: false,
              methods: false,
              parameters: false,
              setters: false,
            },
          ],
          ruleName,
          source,
        });
      });

      it('should fail if a parameter property is not on the same line as its decorators, which are not on the safelist', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                private label: string, @Inject(Engine) engine: Engine,
                                    ~
                @NgConstructor('test')
                      testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @MyCustomDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [
            {
              getters: false,
              methods: false,
              'parameter-properties': {
                safelist: ['NgConstructor'],
              },
              parameters: false,
              setters: false,
            },
          ],
          ruleName,
          source,
        });
      });

      it('should fail if multiple parameter properties are not on the same line as their decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @CustomInput() set test2(value: string) {
              this._test2 = value;
            }
            private _test2: string;

            @Output()
            private readonly testChange = new EventEmitter<string>();

            @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string, @Inject(Engine) engine: Engine,
                @Attribute('test')
                      testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@Parse
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator @CustomCmpDecorator handleCustomClick(): void {
              getValue('custom click');
            }

            @NgDecorator()
            @Codelyzer
            handleCustomClick2(): void {
              getValue('custom click 2');
            }
          }
        `;
        assertFailures(
          ruleName,
          source,
          [
            {
              endPosition: {
                character: 37,
                line: 36,
              },
              message: FAILURE_STRING,
              startPosition: {
                character: 24,
                line: 35,
              },
            },
            {
              endPosition: {
                character: 40,
                line: 37,
              },
              message: FAILURE_STRING,
              startPosition: {
                character: 39,
                line: 36,
              },
            },
          ],
          [
            {
              getters: false,
              methods: false,
              parameters: false,
              properties: false,
              setters: false,
            },
          ]
        );
      });
    });

    describe('parameters', () => {
      it('should fail if a parameter is not on the same line as its decorator', () => {
        const source = `
          function getValue(@Parse
                            ~~~~~~
            type: string): void {
                       ~
            getInnerValue(type);
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail if a parameter is not on the same line as its decorators', () => {
        const source = `
          function getValue(@Parse
                            ~~~~~~
            type: string): void {
                       ~
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [
            {
              getters: false,
              methods: false,
              'parameter-properties': false,
              setters: false,
            },
          ],
          ruleName,
          source,
        });
      });

      it('should fail if a parameter is not on the same line as its decorators, which are not on the safelist', () => {
        const source = `
          function getValue(@Parse @Attr
                            ~~~~~~~~~~~~
            type: string): void {
                       ~
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@ParseStr
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @MyCustomDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [
            {
              getters: false,
              methods: false,
              'parameter-properties': false,
              parameters: {
                safelist: ['ParseStr'],
              },
              setters: false,
            },
          ],
          ruleName,
          source,
        });
      });

      it('should fail if multiple parameters are not on the same line as their decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @CustomInput() set test2(value: string) {
              this._test2 = value;
            }
            private _test2: string;

            @Output()
            private readonly testChange = new EventEmitter<string>();

            @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string, @Inject(Engine) engine: Engine,
                @Attribute('test') testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@Parse
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator @CustomCmpDecorator handleCustomClick(): void {
              getValue('custom click');
            }

            @NgDecorator()
            @Codelyzer
            handleCustomClick2(): void {
              getValue('custom click 2');
            }
          }
        `;
        assertFailures(
          ruleName,
          source,
          [
            {
              endPosition: {
                character: 24,
                line: 2,
              },
              message: FAILURE_STRING,
              startPosition: {
                character: 28,
                line: 1,
              },
            },
            {
              endPosition: {
                character: 28,
                line: 46,
              },
              message: FAILURE_STRING,
              startPosition: {
                character: 38,
                line: 45,
              },
            },
          ],
          [
            {
              getters: false,
              methods: false,
              'parameter-properties': false,
              properties: false,
              setters: false,
            },
          ]
        );
      });
    });

    describe('properties', () => {
      it('should fail if a property is not on the same line as its decorator', () => {
        const source = `
          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Output()
            ~~~~~~~~~
            private readonly testChange = new EventEmitter<string>();
                                                                    ~

            @Output() private readonly test1Change = new EventEmitter<string>();
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail if a property is not on the same line as its decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @CustomOutput
            ~~~~~~~~~~~~~
            @Output()
            private readonly testChange = new EventEmitter<string>();
                                                                    ~

            @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [
            {
              getters: false,
              methods: false,
              'parameter-properties': false,
              parameters: false,
              setters: false,
            },
          ],
          ruleName,
          source,
        });
      });

      it('should fail if a property is not on the same line as its decorators, which are not on the safelist', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @CustomOutput
            ~~~~~~~~~~~~~
            @Output()
            private readonly testChange = new EventEmitter<string>();
                                                                    ~

            @MyOutput()
            private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @MyCustomDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [
            {
              getters: false,
              methods: false,
              'parameter-properties': false,
              parameters: false,
              properties: {
                safelist: ['MyOutput'],
              },
              setters: false,
            },
          ],
          ruleName,
          source,
        });
      });

      it('should fail if multiple properties are not on the same line as their decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @CustomInput() set test2(value: string) {
              this._test2 = value;
            }
            private _test2: string;

            @CustomOutput
            @Output()
            private readonly testChange = new EventEmitter<string>();

            @MyOutput @Output()
            private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string, @Inject(Engine) engine: Engine,
                @Attribute('test')
                      testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@Parse
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator @CustomCmpDecorator handleCustomClick(): void {
              getValue('custom click');
            }

            @NgDecorator()
            @Codelyzer
            handleCustomClick2(): void {
              getValue('custom click 2');
            }
          }
        `;
        assertFailures(
          ruleName,
          source,
          [
            {
              endPosition: {
                character: 69,
                line: 32,
              },
              message: FAILURE_STRING,
              startPosition: {
                character: 12,
                line: 30,
              },
            },
            {
              endPosition: {
                character: 70,
                line: 35,
              },
              message: FAILURE_STRING,
              startPosition: {
                character: 12,
                line: 34,
              },
            },
          ],
          [
            {
              getters: false,
              methods: false,
              'parameter-properties': false,
              parameters: false,
              setters: false,
            },
          ]
        );
      });
    });

    describe('setters', () => {
      it('should fail if a setter is not on the same line as its decorator', () => {
        const source = `
          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            ~~~~~~~~
            set test(value: string) {
              this._test = value;
            }
            ~
            private _test: string;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail if a setter is not on the same line as its decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @CustomSetter
            ~~~~~~~~~~~~~
            @Input()
            set test(value: string) {
              this._test = value;
            }
            ~
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [
            {
              getters: false,
              methods: false,
              'parameter-properties': false,
              parameters: false,
            },
          ],
          ruleName,
          source,
        });
      });

      it('should fail if a setter is not on the same line as its decorators, which are not on the safelist', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @CustomSetter
            ~~~~~~~~~~~~~
            @Input()
            get test(): string {
              return this._test;
            }
            ~
            set test(value: string) {
              this._test = value;
            }
            private _test: string;

            @CustomInput()
            set test(value: string) {
              this._test1 = value;
            }

            @Input() get test1(): string {
              return this._test1;
            }

            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @MyCustomDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          options: [
            {
              methods: false,
              'parameter-properties': false,
              parameters: false,
              setters: {
                safelist: ['CustomInput'],
              },
            },
          ],
          ruleName,
          source,
        });
      });

      it('should fail if multiple setters are not on the same line as their decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @CustomSetter
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput()
            set test1(value: string) {
              this._test1 = value;
            }
            private _test1: string;

            @Input() set test2(value: string) {
              this._test2 = value;
            }
            private _test2: string;

            @Output()
            private readonly testChange = new EventEmitter<string>();

            @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string, @Inject(Engine) engine: Engine,
                @Attribute('test')
                      testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@Parse
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @CustomCmpDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }

            @NgDecorator()
            @Codelyzer
            handleCustomClick2(): void {
              getValue('custom click 2');
            }
          }
        `;
        assertFailures(
          ruleName,
          source,
          [
            {
              endPosition: {
                character: 13,
                line: 15,
              },
              message: FAILURE_STRING,
              startPosition: {
                character: 12,
                line: 11,
              },
            },
            {
              endPosition: {
                character: 13,
                line: 24,
              },
              message: FAILURE_STRING,
              startPosition: {
                character: 12,
                line: 21,
              },
            },
          ],
          [
            {
              getters: false,
              methods: false,
              'parameter-properties': false,
              parameters: false,
              properties: false,
            },
          ]
        );
      });
    });
  });

  describe('success', () => {
    describe('getters', () => {
      it('should succeed if a getter is on the same line as its decorator', () => {
        const source = `
          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input() get test(): string {
              return this._test;
            }
            private _test: string;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a getter is on the same line as its decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @CustomGetter @Input() get test(): string {
              return this._test;
            }
            set test(value: string) {
              this._test = value;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            methods: false,
            'parameter-properties': false,
            parameters: false,
            setters: false,
          },
        ]);
      });

      it('should succeed if a getter is not on the same line as its decorators, which are on the safelist', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @CustomGetter
            @Input()
            get test(): string {
              return this._test;
            }
            set test(value: string) {
              this._test = value;
            }
            private _test: string;

            @CustomInput()
            get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @MyCustomDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: {
              safelist: ['CustomGetter', 'CustomInput'],
            },
            methods: false,
            'parameter-properties': false,
            parameters: false,
            setters: false,
          },
        ]);
      });

      it('should succeed if multiple getters are on the same line as their decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input() get test(): string {
              return this._test;
            }
            set test(value: string) {
              this._test = value;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @Input() set test2(value: string) {
              this._test2 = value;
            }
            private _test2: string;

            @Output()
            private readonly testChange = new EventEmitter<string>();

            @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string, @Inject(Engine) engine: Engine,
                @Attribute('test')
                      testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@Parse
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @CustomCmpDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }

            @NgDecorator()
            @Codelyzer
            handleCustomClick2(): void {
              getValue('custom click 2');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            methods: false,
            'parameter-properties': false,
            parameters: false,
            properties: false,
            setters: false,
          },
        ]);
      });
    });

    describe('methods', () => {
      it('should succeed if a method is on the same line as its decorator', () => {
        const source = `
          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @HostListener('click') handleClick(): void {
              doSomething('click');
            }
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a method is on the same line as its decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator @HostListener('click') handleClick(): void {
              getValue('click');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            'parameter-properties': false,
            parameters: false,
            setters: false,
          },
        ]);
      });

      it('should succeed if a method is on the same line as its decorators, which are on the safelist', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator @HostListener('click') handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @MyCustomDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            methods: {
              safelist: ['CmpDecorator'],
            },
            'parameter-properties': false,
            parameters: false,
            setters: false,
          },
        ]);
      });

      it('should succeed if multiple methods are on the same line as their decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @CustomInput() set test2(value: string) {
              this._test2 = value;
            }
            private _test2: string;

            @Output()
            private readonly testChange = new EventEmitter<string>();

            @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string, @Inject(Engine) engine: Engine,
                @Attribute('test')
                      testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@Parse
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator @HostListener('click') handleClick(): void {
              getValue('click');
            }

            @CmpDecorator @CustomCmpDecorator handleCustomClick(): void {
              getValue('custom click');
            }

            @NgDecorator() @Codelyzer handleCustomClick2(): void {
              getValue('custom click 2');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            'parameter-properties': false,
            parameters: false,
            properties: false,
            setters: false,
          },
        ]);
      });
    });

    describe('parameter-properties', () => {
      it('should succeed if a parameter property is on the same line as its decorator', () => {
        const source = `
          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            constructor(@Attribute('label') private label: string) {}
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a parameter property is on the same line as its decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label') private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            methods: false,
            parameters: false,
            setters: false,
          },
        ]);
      });

      it('should succeed if a parameter property is on the same line as its decorators, which are  on the safelist', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label') private label: string,
              @Inject(Engine) engine: Engine,
                @NgConstructor('test')
                      testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @MyCustomDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            methods: false,
            'parameter-properties': {
              safelist: ['NgConstructor'],
            },
            parameters: false,
            setters: false,
          },
        ]);
      });

      it('should succeed if multiple parameter properties are on the same line as their decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @CustomInput() set test2(value: string) {
              this._test2 = value;
            }
            private _test2: string;

            @Output()
            private readonly testChange = new EventEmitter<string>();

            @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label') private label: string,
            @Inject(Engine) engine: Engine,
                @Attribute('test') testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@Parse
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator @CustomCmpDecorator handleCustomClick(): void {
              getValue('custom click');
            }

            @NgDecorator()
            @Codelyzer
            handleCustomClick2(): void {
              getValue('custom click 2');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            methods: false,
            parameters: false,
            properties: false,
            setters: false,
          },
        ]);
      });
    });

    describe('parameters', () => {
      it('should succeed if a parameter is on the same line as its decorator', () => {
        const source = `
          function getValue(@Parse type: string): void {
            getInnerValue(type);
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a parameter is on the same line as its decorators', () => {
        const source = `
          function getValue(@Parse type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            methods: false,
            'parameter-properties': false,
            setters: false,
          },
        ]);
      });

      it('should succeed if a parameter is on the same line as its decorators, which are on the safelist', () => {
        const source = `
          function getValue(@Parse @Attr type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@ParseStr
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @MyCustomDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            methods: false,
            'parameter-properties': false,
            parameters: {
              safelist: ['ParseStr'],
            },
            setters: false,
          },
        ]);
      });

      it('should succeed if multiple parameters are on the same line as their decorators', () => {
        const source = `
          function getValue(@Parse type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @CustomInput() set test2(value: string) {
              this._test2 = value;
            }
            private _test2: string;

            @Output()
            private readonly testChange = new EventEmitter<string>();

            @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string, @Inject(Engine) engine: Engine,
                @Attribute('test') testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@Parse param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator @CustomCmpDecorator handleCustomClick(): void {
              getValue('custom click');
            }

            @NgDecorator()
            @Codelyzer
            handleCustomClick2(): void {
              getValue('custom click 2');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            methods: false,
            'parameter-properties': false,
            properties: false,
            setters: false,
          },
        ]);
      });
    });

    describe('properties', () => {
      it('should succeed if a property is on the same line as its decorator', () => {
        const source = `
          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Output() private readonly testChange = new EventEmitter<string>();

            @Output() private readonly test1Change = new EventEmitter<string>();
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is on the same line as its decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @CustomOutput @Output() private readonly testChange = new EventEmitter<string>();

            @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            methods: false,
            'parameter-properties': false,
            parameters: false,
            setters: false,
          },
        ]);
      });

      it('should succeed if a property is on the same line as its decorators, which are on the safelist', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @CustomOutput @Output() private readonly testChange = new EventEmitter<string>();

            @MyOutput()
            private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @MyCustomDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            methods: false,
            'parameter-properties': false,
            parameters: false,
            properties: {
              safelist: ['MyOutput'],
            },
            setters: false,
          },
        ]);
      });

      it('should succeed if multiple properties are on the same line as their decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input()
            set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            @CustomInput() set test2(value: string) {
              this._test2 = value;
            }
            private _test2: string;

            @CustomOutput @Output() private readonly testChange = new EventEmitter<string>();

            @MyOutput @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string, @Inject(Engine) engine: Engine,
                @Attribute('test')
                      testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@Parse
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator @CustomCmpDecorator handleCustomClick(): void {
              getValue('custom click');
            }

            @NgDecorator()
            @Codelyzer
            handleCustomClick2(): void {
              getValue('custom click 2');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            methods: false,
            'parameter-properties': false,
            parameters: false,
            setters: false,
          },
        ]);
      });
    });

    describe('setters', () => {
      it('should succeed if a setter is on the same line as its decorator', () => {
        const source = `
          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @Input() set test(value: string) {
              this._test = value;
            }
            private _test: string;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a setter is on the same line as its decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @CustomSetter @Input() set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() get test1(): string {
              return this._test1;
            }
            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            methods: false,
            'parameter-properties': false,
            parameters: false,
          },
        ]);
      });

      it('should succeed if a setter is on the same line as its decorators, which are on the safelist', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @CustomSetter @Input() get test(): string {
              return this._test;
            }
            set test(value: string) {
              this._test = value;
            }
            private _test: string;

            @CustomInput()
            set test(value: string) {
              this._test1 = value;
            }

            @Input() get test1(): string {
              return this._test1;
            }

            private _test1: string;

            constructor(@CustomDecorator @Attribute('label')
                private label: string) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @MyCustomDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            methods: false,
            'parameter-properties': false,
            parameters: false,
            setters: {
              safelist: ['CustomInput'],
            },
          },
        ]);
      });

      it('should succeed if multiple setters are on the same line as their decorators', () => {
        const source = `
          function getValue(@Parse
            type: string): void {
            getInnerValue(type);
          }

          @Component({
            selector: 'app-test',
            template: '<h1>Hey!</h1>'
          })
          class Test {
            @CustomSetter @Input() set test(value: string) {
              this._test = value;
            }
            get test(): string {
              return this._test;
            }
            private _test: string;

            @CustomInput() set test1(value: string) {
              this._test1 = value;
            }
            private _test1: string;

            @Input() set test2(value: string) {
              this._test2 = value;
            }
            private _test2: string;

            @Output()
            private readonly testChange = new EventEmitter<string>();

            @Output() private readonly test1Change = new EventEmitter<string>();

            constructor(@CustomDecorator @Attribute('label')
                private label: string, @Inject(Engine) engine: Engine,
                @Attribute('test')
                      testParam: number) {}

            makeSomething(): void {
              this.makeInternalDoSomething();
            }

            private makeInternalDoSomething(): void {}

            methodWithParamDecorators(@Parse
              param1: string, @Parse param2: number): void {

            }

            @MyCustomDecorator @HostListener('change') veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(): void {
              getValue('very long click');
            }

            @MyCustomDecorator
            @HostListener('click')
            handleClick(): void {
              getValue('click');
            }

            @CmpDecorator
            @CustomCmpDecorator
            handleCustomClick(): void {
              getValue('custom click');
            }

            @NgDecorator()
            @Codelyzer
            handleCustomClick2(): void {
              getValue('custom click 2');
            }
          }
        `;
        assertSuccess(ruleName, source, [
          {
            getters: false,
            methods: false,
            'parameter-properties': false,
            parameters: false,
            properties: false,
          },
        ]);
      });
    });
  });
});
