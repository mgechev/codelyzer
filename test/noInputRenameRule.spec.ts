import { assertSuccess, assertAnnotated } from './testHelper';

const ruleName = 'no-input-rename';

const getMessage = (className: string, propertyName: string): string => {
  return (
    `In the class "${className}", the directive input property "${propertyName}" should not be renamed.` +
    ' However, you should use an alias when the directive name is also an input property, and the directive name' +
    " doesn't describe the property. In this last case, you can disable this rule with `tslint:disable-next-line:no-input-rename`."
  );
};

describe(ruleName, () => {
  describe('failure', () => {
    describe('Component', () => {
      it('should fail when a input property is renamed', () => {
        const source = `
          @Component({
            selector: 'foo'
          })
          class TestComponent {
            @Input('bar') label: string;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          ruleName,
          message: getMessage('TestComponent', 'label'),
          source
        });
      });

      it('should fail when input property is fake renamed', () => {
        const source = `
          @Component({
            selector: 'foo'
          })
          class TestComponent {
            @Input('foo') label: string;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          ruleName,
          message: getMessage('TestComponent', 'label'),
          source
        });
      });
    });

    describe('Directive', () => {
      it('should fail when a input property is renamed', () => {
        const source = `
          @Directive({
            selector: '[foo]
          })
          class TestDirective {
            @Input('labelText') label: string;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          ruleName,
          message: getMessage('TestDirective', 'label'),
          source
        });
      });

      it('should fail when a input property has the same name that the alias', () => {
        const source = `
          @Directive({
            selector: '[label]
          })
          class TestDirective {
            @Input('label') label: string;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          ruleName,
          message: getMessage('TestDirective', 'label'),
          source
        });
      });
      it('should fail when a input property has the same name that the alias', () => {
        const source = `
          @Directive({
            selector: '[foo]
          })
          class TestDirective {
            @Input('label') label: string;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        assertAnnotated({
          ruleName,
          message: getMessage('TestDirective', 'label'),
          source
        });
      });
    });
  });

  describe('success', () => {
    describe('Component', () => {
      it('should succeed when a input property is not renamed', () => {
        const source = `
          @Component
          class TestComponent {
            @Input() label: string;
          }
        `;
        assertSuccess(ruleName, source);
      });
    });

    describe('Directive', () => {
      it("should succeed when the directive's selector is also an input metadata property", () => {
        const source = `
          @Directive({
            selector: '[foo], label2'
          })
          class TestDirective {
            @Input('foo') bar: string;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it("should succeed when the directive's selector is also an input metadata property", () => {
        const source = `
          @Directive({
            selector: '[foo], myselector'
          })
          class TestDirective {
            @Input('myselector') bar: string;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it("should succeed when the directive's selector is also an input property", () => {
        const source = `
          @Directive({
            selector: '[foo], label2'
          })
          class TestDirective {
            @Input() foo: string;
          }
        `;
        assertSuccess(ruleName, source);
      });
    });
  });
});
