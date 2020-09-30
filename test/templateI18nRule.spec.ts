import { Rule } from '../src/templateI18nRule';
import { assertAnnotated, assertSuccess } from './testHelper';
import { assertFailure } from './testHelper';

const {
  FAILURE_STRING_ATTR,
  FAILURE_STRING_TEXT,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    describe('check-id', () => {
      it('should fail with missing id string', () => {
        const source = `
          @Component({
            template: \`
              <div i18n="foo@@">Text</div>
                   ~~~~~~~~~~~~
            \`
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING_ATTR,
          options: ['check-id'],
          ruleName,
          source,
        });
      });

      it('should fail with missing id', () => {
        const source = `
          @Component({
            template: \`
              <div i18n="foo">Text</div>
                   ~~~~~~~~~~
            \`
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING_ATTR,
          options: ['check-id'],
          ruleName,
          source,
        });
      });

      it('should fail with missing id', () => {
        const source = `
          @Component({
            template: \`
              <div i18n>Text</div>
                   ~~~~
            \`
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING_ATTR,
          options: ['check-id'],
          ruleName,
          source,
        });
      });
    });

    describe('check-text', () => {
      it('should fail with missing id string', () => {
        const source = `
          @Component({
            template: \`
              <div>Text</div>
                   ~~~~
            \`
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING_TEXT,
          options: ['check-text'],
          ruleName,
          source,
        });
      });

      it('should fail with missing id string in nested elements', () => {
        const source = `
          @Component({
            template: \`
              <div>
                <span i18n>foo</span>
                <div>Text</div>
                     ~~~~
              </div>
            \`
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING_TEXT,
          options: ['check-text'],
          ruleName,
          source,
        });
      });

      it('should fail with text outside element with i18n attribute', () => {
        const source = `
          @Component({
            template: \`
              <div i18n>Text</div>
              foo
            \`
          })
          class Test {}
        `;
        assertFailure(
          ruleName,
          source,
          {
            endPosition: {
              character: 12,
              line: 5,
            },
            message: FAILURE_STRING_TEXT,
            startPosition: {
              character: 34,
              line: 3,
            },
          },
          ['check-text']
        );
      });

      it('should fail with missing id string', () => {
        const source = `
          @Component({
            template: \`
              <div>Text {{ foo }}</div>
                   ~~~~~~~~~~~~~~
            \`
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING_TEXT,
          options: ['check-text'],
          ruleName,
          source,
        });
      });

      it('should fail with missing id string', () => {
        const source = `
          @Component({
            template: \`
              <div>{{ foo }} text</div>
                   ~~~~~~~~~~~~~~
            \`
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING_TEXT,
          options: ['check-text'],
          ruleName,
          source,
        });
      });

      it('should fail with text outside element with i18n attribute', () => {
        const source = `
          @Component({
            template: \`
              <div i18n>Text</div>
              {{ foo }} text
            \`
          })
          class Test {}
        `;
        assertFailure(
          ruleName,
          source,
          {
            endPosition: {
              character: 12,
              line: 5,
            },
            message: FAILURE_STRING_TEXT,
            startPosition: {
              character: 34,
              line: 3,
            },
          },
          ['check-text']
        );
      });

      it('should fail with text outside multiple nested elements', () => {
        const source = `
          @Component({
            template: \`
              <ul i18n>
                <li>ItemA</li>
                <li>ItemB</li>
                <li>ItemC</li>
              </ul>
              Text
            \`
          })
          class Test {}
        `;
        assertFailure(
          ruleName,
          source,
          {
            endPosition: {
              character: 12,
              line: 9,
            },
            message: FAILURE_STRING_TEXT,
            startPosition: {
              character: 19,
              line: 7,
            },
          },
          ['check-text']
        );
      });
    });
  });

  describe('success', () => {
    describe('check-id', () => {
      it('should work with proper id', () => {
        const source = `
          @Component({
            template: \`
              <div i18n="test@@foo">Text</div>
            \`
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['check-id']);
      });

      it('should work with proper id on ng-container', () => {
        const source = `
          @Component({
            template: \`
              <ng-container i18n="test@@foo">Text</ng-container>
            \`
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['check-id']);
      });

      it('should work with proper id', () => {
        const source = `
          @Component({
            template: \`
              <div i18n="meaning|description@@foo">Text</div>
            \`
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['check-id']);
      });

      it('should work with proper id', () => {
        const source = `
          @Component({
            template: \`
              <div i18n="@@foo">Text</div>
            \`
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['check-id']);
      });
    });

    describe('check-text', () => {
      it('should work with i18n attribute', () => {
        const source = `
          @Component({
            template: \`
              <div i18n>Text</div>
            \`
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['check-text']);
      });

      it('should work with i18n attribute on ng-container', () => {
        const source = `
          @Component({
            template: \`
              <ng-container i18n>Text</ng-container>
            \`
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['check-text']);
      });

      it('should work with proper i18n attribute', () => {
        const source = `
          @Component({
            template: \`
              <div i18n="@@minlength">
                Use at least {{ minLength }} characters
              </div>
            \`
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['check-text']);
      });

      it('should work with input and text', () => {
        const source = `
          @Component({
            template: \`
              <label class="checkbox-inline" i18n="Bearbeiten eines Artikels|Veröffentlichung im Internet?">
                <input
                  type="checkbox"
                  name="article.publish"
                  role="edit"
                  [(ngModel)]="article.publish">
                Veröffentlichen
              </label>
            \`
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['check-text']);
      });

      it('should work with plural', () => {
        const source = `
          @Component({
            template: \`
              <span i18n>
                Updated {minutes, plural, =0 {just now} =1 {one minute ago} other {{ {minutes}} minutes ago }}
              </span>
            \`
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['check-text']);
      });

      it('should work without i18n attribute and interpolation', () => {
        const source = `
          @Component({
            template: \`
              <div>{{ text }}</div>
            \`
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['check-text']);
      });

      it('should work with multiple valid elements', () => {
        const source = `
          @Component({
            template: \`
              <div>{{ text }}</div>
              <div i18n>
                Text
                <span i18n>foo</span>
              </div>
            \`
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['check-text']);
      });

      it('should work with multiple nested elements', () => {
        const source = `
          @Component({
            template: \`
              <ul i18n>
                <li>ItemA</li>
                <li>ItemB</li>
                <li>ItemC</li>
              </ul>
            \`
          })
          class Test {}
        `;
        assertSuccess(ruleName, source, ['check-text']);
      });
    });
  });
});
