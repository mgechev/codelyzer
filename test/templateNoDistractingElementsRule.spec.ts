import { getFailureMessage, Rule } from '../src/templateNoDistractingElementsRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when distracting element marquee is used', () => {
      const source = `
        @Component({
          template: \`
            <marquee></marquee>
            ~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: getFailureMessage('marquee'),
        ruleName,
        source,
      });
    });

    it('should fail when distracting element blink is used', () => {
      const source = `
        @Component({
          template: \`
            <blink></blink>
            ~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: getFailureMessage('blink'),
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should work when distracting element is not used', () => {
      const source = `
        @Component({
          template: \`
            <div>Valid</div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
