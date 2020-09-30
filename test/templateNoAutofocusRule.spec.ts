import { assertAnnotated, assertMultipleAnnotated, assertSuccess } from './testHelper';
import { Rule } from '../src/templateNoAutofocusRule';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if autofocus attribute is used', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '<div autofocus>Autofocus</div>'
                          ~~~~~~~~~
        })
        class Test {
          constructor(foo: Observable<Boolean>) {}
        }
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName: ruleName,
        source,
      });
    });

    it('should fail if autofocus input is used', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '<div [attr.autofocus]="false">Autofocus</div>'
                          ~~~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {
          constructor(foo: Observable<Boolean>) {}
        }
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName: ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed if autofocus is not used', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '<div>No Autofocus</div>'
        })
        class Test {
          constructor(foo: Observable<Boolean>) {}
        }
      `;
      assertSuccess(ruleName, source);
    });
  });
});
