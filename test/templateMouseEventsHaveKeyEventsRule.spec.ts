import { Rule } from '../src/templateMouseEventsHaveKeyEventsRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING_MOUSE_OUT,
  FAILURE_STRING_MOUSE_OVER,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when mouseover is not accompanied with focus', () => {
      const source = `
        @Component({
          template: \`
            <div (mouseover)="onMouseOver()"></div>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING_MOUSE_OVER,
        ruleName,
        source,
      });
    });

    it('should fail when mouseout is not accompanied with blur', () => {
      const source = `
        @Component({
          template: \`
            <div (mouseout)="onMouseOut()"></div>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING_MOUSE_OUT,
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should work find when mouse events are associated with key events', () => {
      const source = `
        @Component({
          template: \`
            <div (mouseover)="onMouseOver()" (focus)="onMouseOver()" (mouseout)="onMouseOut()" (blur)="onMouseOut()"></div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
