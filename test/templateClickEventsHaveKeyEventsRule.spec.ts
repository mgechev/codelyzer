import { Rule } from '../src/templateClickEventsHaveKeyEventsRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when click is not accompanied with key events', () => {
      const source = `
        @Component({
          template: \`
            <div (click)="onClick()"></div>
            ~~~~~~~~~~~~~~~~~~~~~~~~~
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
  });

  describe('success', () => {
    it('should work find when click events are associated with key events', () => {
      const source = `
        @Component({
          template: \`
          <div (click)="onClick()" (keyup)="onKeyup()"></div>
          <div (click)="onClick()" (keydown)="onKeyDown()"></div>
          <div (click)="onClick()" (keypress)="onKeyPress()"></div>
          <div (click)="onClick()" (keyup)="onKeyup()" (keydown)="onKeyDown()" (keypress)="onKeyPress()"></div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
