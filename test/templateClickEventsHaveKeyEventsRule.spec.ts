import { Rule } from '../src/templateClickEventsHaveKeyEventsRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
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
        source,
      });
    });

    it('should fail when click is not accompanied with key events on non interactive element', () => {
      const source = `
        @Component({
          template: \`
            <header (click)="onClick()"></header>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail when click is not accompanied with key events on interactive element without attributes that make them interactive', () => {
      const source = `
        @Component({
          template: \`
            <a (click)="onClick()"></a>
            ~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail when click is not accompanied with key events and has aria-hidden attribute as false', () => {
      const source = `
        @Component({
          template: \`
            <div (click)="onClick()" aria-hidden="false"></div>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail when click is not accompanied with key events and has aria-hidden input as false', () => {
      const source = `
        @Component({
          template: \`
            <div (click)="onClick()" [attr.aria-hidden]="'false'"></div>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail when click is not accompanied with key events and has role other than presentational', () => {
      const source = `
        @Component({
          template: \`
            <div (click)="onClick()" role="header"></div>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail when click is not accompanied with key events and has aria-hidden attribute as false', () => {
      const source = `
        @Component({
          template: \`
            <div (click)="onClick()" role="aside"></div>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail when click is not accompanied with key events and has aria-hidden input as false', () => {
      const source = `
        @Component({
          template: \`
            <div (click)="onClick()" [attr.role]="'header'"></div>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should work when click events are associated with key events', () => {
      const source = `
        @Component({
          template: \`
            <div (click)="onClick()" (keyup)="onKeyup()"></div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should work when click events are associated with key pseudo events', () => {
      const source = `
        @Component({
          template: \`
            <div (click)="onClick()" (keyup.enter)="onKeyup()"></div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should work when click events are passed to custom element', () => {
      const source = `
        @Component({
          template: \`
            <cui-button (click)="onClick()"></cui-button>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should work when element has aria-hidden', () => {
      const source = `
        @Component({
          template: \`
            <div (click)="onClick()" aria-hidden="true"></div>
            <div (click)="onClick()" [attr.aria-hidden]="true"></div>
            <div (click)="onClick()" [attr.aria-hidden]="ariaHidden"></div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should work when element has presentation role', () => {
      const source = `
        @Component({
          template: \`
            <div (click)="onClick()" role="presentation"></div>
            <div (click)="onClick()" [attr.role]="'none'"></div>
            <div (click)="onClick()" [attr.role]="roleName"></div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should work when element is interactive', () => {
      const source = `
        @Component({
          template: \`
            <input (click)="onClick()">
            <button (click)="onClick()"></button>
            <textarea (click)="onClick()"></textarea>
            <select (click)="onClick()">
              <option (click)="onClick()"></option>
            </select>
            <textarea (click)="onClick()"></textarea>
            <a href="#" (click)="onClick()"></a>
            <a [attr.href]="href" class="anchor" (click)="onClick()"></a>
            <a [routerLink]="'route'" (click)="onClick()"></a>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
