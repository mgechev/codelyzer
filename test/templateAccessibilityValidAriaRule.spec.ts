import { getFailureMessage, Rule } from '../src/templateAccessibilityValidAriaRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when aria attributes are misspelled or if they does not exist', () => {
      const source = `
        @Component({
          template: \`
            <input aria-labelby="text">
                   ~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: getFailureMessage('aria-labelby'),
        ruleName,
        source,
      });
    });

    it('should fail when using wrong aria attributes with inputs', () => {
      const source = `
        @Component({
          template: \`
            <input [attr.aria-labelby]="text">
                   ~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: getFailureMessage('aria-labelby'),
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should work when the aria attributes are correctly named', () => {
      const source = `
        @Component({
          template: \`
          <input aria-labelledby="Text">
          <input [attr.aria-labelledby]="text">
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
