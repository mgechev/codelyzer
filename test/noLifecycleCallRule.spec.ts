import { Rule } from '../src/noLifecycleCallRule';
import { assertAnnotated, assertMultipleAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    describe('Component', () => {
      it('should fail when explicitly calling ngAfterContentChecked()', () => {
        const source = `
          @Component()
          class Test {
            test() {
              this.ngAfterContentChecked();
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngAfterContentInit()', () => {
        const source = `
          @Component()
          class Test {
            test() {
              this.ngAfterContentInit();
              ~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngAfterViewChecked()', () => {
        const source = `
          @Component()
          class Test {
            test() {
              this.ngAfterViewChecked();
              ~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngAfterViewInit()', () => {
        const source = `
          @Component()
          class Test {
            test() {
              this.ngAfterViewInit();
              ~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngDoCheck()', () => {
        const source = `
          @Component()
          class Test {
            test() {
              this.ngDoCheck();
              ~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngOnChanges()', () => {
        const source = `
          @Component()
          class Test {
            test() {
              this.ngOnChanges();
              ~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngOnInit()', () => {
        const source = `
          @Component()
          class Test {
            test() {
              this.ngOnInit();
              ~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });
    });

    describe('Directive', () => {
      it('should fail when explicitly calling ngAfterContentChecked()', () => {
        const source = `
          @Directive()
          class Test {
            test() {
              this.ngAfterContentChecked();
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngAfterContentInit()', () => {
        const source = `
          @Directive()
          class Test {
            test() {
              this.ngAfterContentInit();
              ~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngAfterViewChecked()', () => {
        const source = `
          @Directive()
          class Test {
            test() {
              this.ngAfterViewChecked();
              ~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngAfterViewInit()', () => {
        const source = `
          @Directive()
          class Test {
            test() {
              this.ngAfterViewInit();
              ~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngDoCheck()', () => {
        const source = `
          @Directive()
          class Test {
            test() {
              this.ngDoCheck();
              ~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngOnChanges()', () => {
        const source = `
          @Directive()
          class Test {
            test() {
              this.ngOnChanges();
              ~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngOnInit()', () => {
        const source = `
          @Directive()
          class Test {
            test() {
              this.ngOnInit();
              ~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });
    });

    describe('Injectable', () => {
      it('should fail when explicitly calling ngAfterContentChecked()', () => {
        const source = `
          @Injectable()
          class Test {
            test() {
              this.ngAfterContentChecked();
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngAfterContentInit()', () => {
        const source = `
          @Injectable()
          class Test {
            test() {
              this.ngAfterContentInit();
              ~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngAfterViewChecked()', () => {
        const source = `
          @Injectable()
          class Test {
            test() {
              this.ngAfterViewChecked();
              ~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngAfterViewInit()', () => {
        const source = `
          @Injectable()
          class Test {
            test() {
              this.ngAfterViewInit();
              ~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngDoCheck()', () => {
        const source = `
          @Injectable()
          class Test {
            test() {
              this.ngDoCheck();
              ~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngOnChanges()', () => {
        const source = `
          @Injectable()
          class Test {
            test() {
              this.ngOnChanges();
              ~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngOnInit()', () => {
        const source = `
          @Injectable()
          class Test {
            test() {
              this.ngOnInit();
              ~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });
    });

    describe('Pipe', () => {
      it('should fail when explicitly calling ngAfterContentChecked()', () => {
        const source = `
          @Pipe()
          class Test {
            test() {
              this.ngAfterContentChecked();
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngAfterContentInit()', () => {
        const source = `
          @Pipe()
          class Test {
            test() {
              this.ngAfterContentInit();
              ~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngAfterViewChecked()', () => {
        const source = `
          @Pipe()
          class Test {
            test() {
              this.ngAfterViewChecked();
              ~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngAfterViewInit()', () => {
        const source = `
          @Pipe()
          class Test {
            test() {
              this.ngAfterViewInit();
              ~~~~~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngDoCheck()', () => {
        const source = `
          @Pipe()
          class Test {
            test() {
              this.ngDoCheck();
              ~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngOnChanges()', () => {
        const source = `
          @Pipe()
          class Test {
            test() {
              this.ngOnChanges();
              ~~~~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });

      it('should fail when explicitly calling ngOnInit()', () => {
        const source = `
          @Pipe()
          class Test {
            test() {
              this.ngOnInit();
              ~~~~~~~~~~~~~~~
            }
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source,
        });
      });
    });

    describe('multiple calls per file', () => {
      it('should fail when explicitly calling multiple lifecycle methods', () => {
        const source = `
          @Component()
          class Test {
            test(): void {
              this.ngDoCheck();
              ~~~~~~~~~~~~~~~~
              this.ngOnChanges();
              ^^^^^^^^^^^^^^^^^^
            }
          }

          @Directive()
          class TestDirective {
            test2(): void {
              this.ngOnDestroy();
              ##################
              this.ngOnInit();
              %%%%%%%%%%%%%%%
            }
          }
        `;
        assertMultipleAnnotated({
          failures: [
            {
              char: '~',
              msg: FAILURE_STRING,
            },
            {
              char: '^',
              msg: FAILURE_STRING,
            },
            {
              char: '#',
              msg: FAILURE_STRING,
            },
            {
              char: '%',
              msg: FAILURE_STRING,
            },
          ],
          ruleName,
          source,
        });
      });
    });
  });

  describe('success', () => {
    it('should succeed when explicitly calling multiple non lifecycle methods', () => {
      const source = `
          @Component()
          class Test {
            test(): void {
              this.ng4fterViewChecked();
              this.ngOnChange$();
            }
          }

          @Directive()
          class TestDirective {
            test2(): void {
              this.ngOnD3stroy();
              this.ngOn1nit();
            }
          }
        `;
      assertSuccess(ruleName, source);
    });
  });
});
