import { Rule } from '../src/templateAccessibilityTabindexNoPositiveRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_MESSAGE,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when tabindex attr is positive', () => {
      const source = `
        @Component({
          template: \`
          <div tabindex="5"></div>
          ~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_MESSAGE,
        ruleName,
        source,
      });
    });

    it('should fail when tabindex input is positive', () => {
      const source = `
        @Component({
          template: \`
          <div [attr.tabindex]="1"></div>
          ~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_MESSAGE,
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should work with tab index is not positive', () => {
      const source = `
        @Component({
          template: \`
            <span tabindex="-1"></span>
            <span tabindex="0"></span>
            <span [attr.tabindex]="-1"></span>
            <span [attr.tabindex]="0"></span>
            <span [attr.tabindex]="tabIndex"></span>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
