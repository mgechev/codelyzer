import { assertSuccess, assertAnnotated } from './testHelper';
import { assertFailure } from './testHelper';

describe('i18n', () => {
  describe('check-id', () => {
    it('should work with proper id', () => {
      const source = `
        @Component({
          template: \`
            <div i18n="test@@foo">Text</div>
          \`
        })
        class Bar {}
      `;
      assertSuccess('i18n', source, ['check-id']);
    });

    it('should work with proper id on ng-container', () => {
      const source = `
        @Component({
          template: \`
            <ng-container i18n="test@@foo">Text</ng-container>
          \`
        })
        class Bar {}
      `;
      assertSuccess('i18n', source, ['check-id']);
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
        class Bar {}
      `;
      assertSuccess('i18n', source, ['check-text']);
    });

    it('should work with proper id', () => {
      const source = `
        @Component({
          template: \`
            <div i18n="meaning|description@@foo">Text</div>
          \`
        })
        class Bar {}
      `;
      assertSuccess('i18n', source, ['check-id']);
    });

    it('should work with proper id', () => {
      const source = `
        @Component({
          template: \`
            <div i18n="@@foo">Text</div>
          \`
        })
        class Bar {}
      `;
      assertSuccess('i18n', source, ['check-id']);
    });

    it('should fail with missing id string', () => {
      const source = `
        @Component({
          template: \`
            <div i18n="foo@@">Text</div>
                 ~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'i18n',
        options: ['check-id'],
        source,
        message: 'Missing custom message identifier. For more information visit https://angular.io/guide/i18n'
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
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'i18n',
        options: ['check-id'],
        source,
        message: 'Missing custom message identifier. For more information visit https://angular.io/guide/i18n'
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
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'i18n',
        options: ['check-id'],
        source,
        message: 'Missing custom message identifier. For more information visit https://angular.io/guide/i18n'
      });
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
        class Bar {}
      `;
      assertSuccess('i18n', source, ['check-text']);
    });

    it('should work with i18n attribute on ng-container', () => {
      const source = `
        @Component({
          template: \`
            <ng-container i18n>Text</ng-container>
          \`
        })
        class Bar {}
      `;
      assertSuccess('i18n', source, ['check-text']);
    });

    it('should work with input and text', () => {
      const source = `
        @Component({
          template: \`
            <label class="checkbox-inline" i18n="Bearbeiten eines Artikels|Veröffentlichung im Internet?">
              <input name="article.publish" [(ngModel)]="article.publish" role="edit" type="checkbox">
              Veröffentlichen
            </label>
          \`
        })
        class Bar {}
      `;
      assertSuccess('i18n', source, ['check-text']);
    });

    it('should work with plural', () => {
      const source = `
        @Component({
          template: \`
            <span i18n>Updated {minutes, plural, =0 {just now} =1 {one minute ago} other {{{minutes}} minutes ago}}</span>
          \`
        })
        class Bar {}
      `;
      assertSuccess('i18n', source, ['check-text']);
    });

    it('should work without i18n attribute & interpolation', () => {
      const source = `
        @Component({
          template: \`
            <div>{{text}}</div>
          \`
        })
        class Bar {}
      `;
      assertSuccess('i18n', source, ['check-text']);
    });

    it('should work with multiple valid elements', () => {
      const source = `
        @Component({
          template: \`
            <div>{{text}}</div>
            <div i18n>
              Text
              <span i18n>foo</span>
            </div>
          \`
        })
        class Bar {}
      `;
      assertSuccess('i18n', source, ['check-text']);
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
        class Bar {}
      `;
      assertSuccess('i18n', source, ['check-text']);
    });

    it('should fail with missing id string', () => {
      const source = `
        @Component({
          template: \`
            <div>Text</div>
                 ~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'i18n',
        options: ['check-text'],
        source,
        message: 'Each element containing text node should have an i18n attribute'
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
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'i18n',
        options: ['check-text'],
        source,
        message: 'Each element containing text node should have an i18n attribute'
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
        class Bar {}
      `;
      assertFailure(
        'i18n',
        source,
        {
          message: 'Each element containing text node should have an i18n attribute',
          startPosition: {
            line: 3,
            character: 32
          },
          endPosition: {
            line: 5,
            character: 10
          }
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
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'i18n',
        options: ['check-text'],
        source,
        message: 'Each element containing text node should have an i18n attribute'
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
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'i18n',
        options: ['check-text'],
        source,
        message: 'Each element containing text node should have an i18n attribute'
      });
    });

    it('should fail with text outside element with i18n attribute', () => {
      const source = `
        @Component({
          template: \`
            <div i18n>Text</div>
            {{foo}} text
          \`
        })
        class Bar {}
      `;
      assertFailure(
        'i18n',
        source,
        {
          message: 'Each element containing text node should have an i18n attribute',
          startPosition: {
            line: 3,
            character: 32
          },
          endPosition: {
            line: 5,
            character: 10
          }
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
        class Bar {}
      `;
      assertFailure(
        'i18n',
        source,
        {
          message: 'Each element containing text node should have an i18n attribute',
          startPosition: {
            line: 7,
            character: 17
          },
          endPosition: {
            line: 9,
            character: 10
          }
        },
        ['check-text']
      );
    });
  });
});
