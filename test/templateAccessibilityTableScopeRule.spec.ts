import { Rule } from '../src/templateAccessibilityTableScopeRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_MESSAGE,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when element other than th has scope', () => {
      const source = `
        @Component({
          template: \`
            <div scope></div>
            ~~~~~~~~~~~
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

    it('should fail when element other than th has scope input', () => {
      const source = `
        @Component({
          template: \`
            <div [attr.scope]="scope"></div>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~
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
    it('should work when th has scope', () => {
      const source = `
        @Component({
          template: \`
            <th scope="col"></th>
            <th [attr.scope]="col"></th>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
