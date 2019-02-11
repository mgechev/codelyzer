import { Rule } from '../src/templateAccessibilityAnchorContentRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_MESSAGE,
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail with no content in anchor tag', () => {
      const source = `
        @Component({
          template: \`
            <a href="#" [routerLink]="['route1']"></a>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_MESSAGE,
        ruleName,
        source
      });
    });
  });

  describe('success', () => {
    it('should work when anchor has any kind of content in it', () => {
      const source = `
        @Component({
          template: \`
            <a>Anchor Content!</a>
            <a><app-content></app-content></a>
            <a [innerHTML]="dangerouslySetHTML"></a>
            <a [innerText]="text"></a>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
