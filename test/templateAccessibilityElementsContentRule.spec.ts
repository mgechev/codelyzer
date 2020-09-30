import { getErrorMessage, Rule } from '../src/templateAccessibilityElementsContentRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail with no content in heading tag', () => {
      const source = `
        @Component({
          template: \`
            <h1 class="size-1"></h1>
            ~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: getErrorMessage('h1'),
        ruleName,
        source,
      });
    });

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
        message: getErrorMessage('a'),
        ruleName,
        source,
      });
    });

    it('should fail with no content in anchor tag', () => {
      const source = `
        @Component({
          template: \`
            <button></button>
            ~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: getErrorMessage('button'),
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should work when anchor or headings has any kind of content in it', () => {
      const source = `
        @Component({
          template: \`
            <h1>Heading Content!</h1>
            <h2><app-content></app-content></h2>
            <h3 [innerHTML]="dangerouslySetHTML"></h3>
            <h4 [innerText]="text"></h4>
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
