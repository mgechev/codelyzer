import { assertSuccess, assertAnnotated } from './testHelper';

const ruleName = 'no-input-rename';

const getMessage = (className: string, propertyName: string): string => {
  return `In the class "${className}", the directive input property "${propertyName}" should not be renamed.`;
};

describe(ruleName, () => {
  describe('failure', () => {
    describe('Component', () => {
      it('should fail when a input property is renamed', () => {
        const source = `
          @Component
          class TestComponent {
            @Input('labelAttribute') label: string;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
          @Component
          class TestComponent {
            @Input('label') label: string;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
          @Directive
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

      it(`should fail when input property is renamed and it's different from directive's selector`, () => {
        const source = `
          @Directive({
            selector: '[label], label2'
          })
          class TestDirective {
            @Input('label') labelText: string;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;

        assertAnnotated({
          ruleName,
          message: getMessage('TestDirective', `labelText`),
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
      it('should succeed when the directive name is also an input property', () => {
        const source = `
          @Directive({
            selector: '[label], label2'
          })
          class TestDirective {
            @Input('labelText') label: string;
          }
        `;

        assertSuccess(ruleName, source);
      });
    });
  });
});
