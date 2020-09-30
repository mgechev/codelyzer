import { getFailureMessage, Rule } from '../src/noOutputRenameRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when a directive output property is renamed', () => {
      const source = `
        @Component({
          template: 'test'
        })
        class TestComponent {
          @Output('onChange') change = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({
        message: getFailureMessage(),
        ruleName,
        source,
      });
    });

    it('should fail when a directive output property is renamed and its name is strictly equal to the property', () => {
      const source = `
        @Component({
          template: 'test'
        })
        class TestComponent {
          @Output('change') change = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({ message: getFailureMessage(), ruleName, source });
    });

    it("should fail when the directive's selector matches exactly both property name and the alias", () => {
      const source = `
        @Directive({
          selector: '[test], foo'
        })
        class TestDirective {
          @Output('test') test = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({ message: getFailureMessage(), ruleName, source });
    });
  });

  describe('success', () => {
    it('should succeed when a directive output property is properly used', () => {
      const source = `
        @Component({
          template: 'test'
        })
        class TestComponent {
          @Output() change = new EventEmitter<void>();
        }
      `;
      assertSuccess(ruleName, source);
    });

    it("should succeed when the directive's selector is also an output property", () => {
      const source = `
          @Directive({
            selector: '[foo], test'
          })
          class TestDirective {
            @Output('foo') bar = new EventEmitter<void>();
          }
        `;
      assertSuccess(ruleName, source);
    });
  });
});
