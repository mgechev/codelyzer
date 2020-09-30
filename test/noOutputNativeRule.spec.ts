import { getFailureMessage, Rule } from '../src/noOutputNativeRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    describe('Component', () => {
      it('should fail if a property is named "change"', () => {
        const source = `
          @Component()
          class Test {
            @Output() change = new EventEmitter<string>();
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        const message = getFailureMessage({
          className: 'Test',
          propertyName: 'change',
        });
        assertAnnotated({
          message,
          ruleName,
          source,
        });
      });

      it('should fail if a property is renamed to "change"', () => {
        const source = `
          @Component()
          class Test {
            @Output('change') _change = new EventEmitter<string>();
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        const message = getFailureMessage({
          className: 'Test',
          propertyName: '_change',
        });
        assertAnnotated({
          message,
          ruleName,
          source,
        });
      });
    });

    describe('Directive', () => {
      it('should fail if a property is named "change"', () => {
        const source = `
          @Directive()
          class Test {
            @Output() change = new EventEmitter<string>();
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        const message = getFailureMessage({
          className: 'Test',
          propertyName: 'change',
        });
        assertAnnotated({
          message,
          ruleName,
          source,
        });
      });

      it('should fail if a property is renamed to "change"', () => {
        const source = `
          @Directive()
          class Test {
            @Output('change') _change = new EventEmitter<string>();
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        `;
        const message = getFailureMessage({
          className: 'Test',
          propertyName: '_change',
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
      it('should succeed if a property is properly named', () => {
        const source = `
          @Component()
          class Test {
            @Output() buttonChange = new EventEmitter<string>();
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is properly renamed', () => {
        const source = `
          @Component()
          class Test {
            @Output('buttonChange') _buttonChange = new EventEmitter<string>();
          }
        `;
        assertSuccess(ruleName, source);
      });
    });

    describe('Directive', () => {
      it('should succeed if a property is properly named', () => {
        const source = `
          @Directive()
          class Test {
            @Output() buttonChange = new EventEmitter<string>();
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a property is properly renamed', () => {
        const source = `
          @Directive()
          class Test {
            @Output('buttonChange') _buttonChange = new EventEmitter<string>();
          }
        `;
        assertSuccess(ruleName, source);
      });
    });
  });
});
