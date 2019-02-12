import { Rule } from '../src/templateAccessibilityLabelForRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it("should fail when label doesn't have for attribute", () => {
      const source = `
        @Component({
          template: \`
            <label>Label</label>
            ~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source
      });
    });

    it("should fail when custom label doesn't have label attribute", () => {
      const source = `
        @Component({
          template: \`
            <app-label></app-label>
            ~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
        options: {
          labelComponents: ['app-label'],
          labelAttributes: ['id']
        }
      });
    });
  });

  describe('success', () => {
    it('should work when label has for attribute', () => {
      const source = `
        @Component({
          template: \`
            <label for="id"></label>
            <label [attr.for]="id"></label>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should work when label are associated implicitly', () => {
      const source = `
        @Component({
          template: \`
            <label>
              Label
              <input />
            </label>

            <label>
              Label
              <span><input /></span>
            </label>

            <app-label>
              <span>
                <app-input></app-input>
              </span>
            </app-label>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source, {
        labelComponents: ['app-label'],
        controlComponents: ['app-input']
      });
    });

    it("should fail when label doesn't have for attribute", () => {
      const source = `
        @Component({
          template: \`
            <label>
              <span>
                <span>
                  <input>
                </span>
              </span>
            </label>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should work when custom label has label attribute', () => {
      const source = `
        @Component({
          template: \`
          <app-label id="name"></app-label>
          <app-label [id]="name"></app-label>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source, {
        labelComponents: ['app-label'],
        labelAttributes: ['id']
      });
    });
  });
});
