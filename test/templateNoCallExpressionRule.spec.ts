import { Rule } from '../src/templateNoCallExpressionRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail with call expression in expression binding', () => {
      const source = `
        @Component({
          template: '<a href="http://example.com">{{ getInfo() }}</a>'
                                                     ~~~~~~~~~~
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail with call expression in property binding', () => {
      const source = `
        @Component({
          template: '<a [href]="getUrl()">info</a>'
                                ~~~~~~~~
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail with a property access call expression', () => {
      const source = `
        @Component({
          template: '<a [href]="helper.getUrl()">info</a>'
                                ~~~~~~~~~~~~~~~
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
    it('should pass with no call expression', () => {
      const source = `
        @Component({
          template: '{{ info }}'
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass with call expression in an output handler', () => {
      const source = `
        @Component({
          template: '<button type="button" (click)="handleClick()">Click Here</button>'
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should allow $any to wrap unknown variables', () => {
      const source = `
        @Component({
          template: '{{ $any(info) }}'
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
