import { Rule } from '../src/templateAccessibilityLabelForRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if a label does not have a "for" attribute', () => {
      const source = `
        @Component({
          template: \`
            <label>Label</label>
            ~~~~~~~
          \`
        })
        class Test {}
      `;

      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail if a label component does not have a label attribute', () => {
      const source = `
        @Component({
          template: \`
            <app-label></app-label>
            ~~~~~~~~~~~
          \`
        })
        class Test {}
      `;
      const options = [
        {
          labelAttributes: ['id'],
          labelComponents: ['app-label'],
        },
      ];

      assertAnnotated({
        message: FAILURE_STRING,
        options,
        ruleName,
        source,
      });
    });

    it('should fail if a label component does not have a control component inside it', () => {
      const source = `
        @Component({
          template: \`
            <app-label></app-label>
            ~~~~~~~~~~~
          \`
        })
        class Test {}
      `;
      const options = [
        {
          controlComponents: ['app-input'],
          labelComponents: ['app-label'],
        },
      ];

      assertAnnotated({
        message: FAILURE_STRING,
        options,
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed if a label has "for" attribute', () => {
      const source = `
        @Component({
          template: \`
            <label for="id"></label>
            <label for="{{id}}"></label>
            <label [attr.for]="id"></label>
          \`
        })
        class Test {}
      `;

      assertSuccess(ruleName, source);
    });

    it('should succeed if a label component has a label attribute', () => {
      const source = `
        @Component({
          template: \`
            <app-label id="name"></app-label>
            <app-label id="{{name}}"></app-label>
            <app-label [id]="name"></app-label>
          \`
        })
        class Test {}
      `;
      const options = [
        {
          labelAttributes: ['id'],
          labelComponents: ['app-label'],
        },
      ];

      assertSuccess(ruleName, source, options);
    });

    it('should succeed if a label component has a control component inside it', () => {
      const source = `
        @Component({
          template: \`
            <label>
              Label
              <input>
            </label>

            <label>
              Label
              <span><input></span>
            </label>

            <app-label>
              <span>
                <app-input></app-input>
              </span>
            </app-label>
          \`
        })
        class Test {}
      `;
      const options = [
        {
          controlComponents: ['app-input'],
          labelComponents: ['app-label'],
        },
      ];

      assertSuccess(ruleName, source, options);
    });

    it('should succeed if a label component is associated with a form element', () => {
      const source = `
        @Component({
          template: \`
            <ng-container *ngFor="let item of itemList; let i = index">
              <label for="item-{{i}}">My label #{{i}</label>
              <input type="text" id="item-{{i}}" [(ngModel)]="item.name">
            </ng-container>
          \`
        })
        class Test {}
      `;

      assertSuccess(ruleName, source);
    });
  });
});
