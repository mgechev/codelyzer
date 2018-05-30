import { createSourceFile, ScriptTarget, SourceFile } from 'typescript/lib/typescript';
import { getStylesFailure, getTemplateFailure, PropertyPair, Rule } from '../src/maxInlineDeclarationsRule';
import { assertFailure, assertFailures, assertSuccess } from './testHelper';

type PropertyPairArray = ReadonlyArray<PropertyPair>;

const {
  metadata: { ruleName }
} = Rule;
const filePath = `${__dirname}/../../test/fixtures/inlineTemplateMaxLines/foo.ts`;

const getSourceFile = (code: string): SourceFile => {
  return createSourceFile(filePath, code, ScriptTarget.ES2015, true);
};

describe(ruleName, () => {
  describe('template', () => {
    describe('failure', () => {
      it('should fail when the number of lines exceeds the default lines limit', () => {
        const source = `
          @Component({
            selector: 'foobar',
            template: \`
              <div>first line</div>
              <div>second line</div>
              <div>third line</div>
              <div>fourth line</div>
            \`
          })
          class Test {}
        `;
        assertFailure(ruleName, source, {
          endPosition: { character: 13, line: 8 },
          message: getTemplateFailure(4),
          startPosition: { character: 22, line: 3 }
        });
      });

      it('should fail when the number of lines exceeds a custom lines limit', () => {
        const source = `
          @Component({
            selector: 'foobar',
            template: '<div>first line</div>'
          })
          class Test {}
        `;
        const options: PropertyPairArray = [{ template: 0 }];
        assertFailure(
          ruleName,
          source,
          {
            endPosition: { character: 45, line: 3 },
            message: getTemplateFailure(1, options[0].template),
            startPosition: { character: 22, line: 3 }
          },
          options
        );
      });
    });

    describe('success', () => {
      it('should succeed when the number of lines does not exceeds the default lines limit', () => {
        const source = `
          @Component({
            selector: 'foobar',
            template: '<div>just one line template</div>'
          })
          class Test {}
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed when a negative limit is used and the number of lines does not exceeds the default lines limit', () => {
        const source = `
          @Component({
            selector: 'foobar',
            template: '<div>first line</div>'
          })
          class Test {}
        `;
        const options: PropertyPairArray = [{ template: -5 }];
        assertSuccess(ruleName, source, options);
      });
    });
  });

  describe('templateUrl', () => {
    it('should succeed when the number of lines of a template file exceeds the default lines limit', () => {
      const source = `
        @Component({
          selector: 'foobar',
          templateUrl: './foobar.html'
        })
        class Test {}
      `;
      assertSuccess(ruleName, getSourceFile(source));
    });
  });

  describe('styles', () => {
    describe('failure', () => {
      it('should fail when the number of lines exceeds the default lines limit', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div {
                  display: block;
                  height: 40px;
                }
              \`
            ]
          })
          class Test {}
        `;
        assertFailure(ruleName, source, {
          endPosition: { character: 15, line: 9 },
          message: getStylesFailure(4),
          startPosition: { character: 14, line: 4 }
        });
      });

      it('should fail when the sum of lines (from separate inline styles) exceeds the default lines limit', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div {
                  display: block;
                  height: 40px;
                }
              \`,
              \`
                span {
                  float: left;
                  width: 30px;
                }
              \`
            ]
          })
          class Test {}
        `;
        const message = getStylesFailure(8);
        assertFailures(ruleName, source, [
          {
            endPosition: { character: 15, line: 9 },
            message,
            startPosition: { character: 14, line: 4 }
          },
          {
            endPosition: { character: 15, line: 15 },
            message,
            startPosition: { character: 14, line: 10 }
          }
        ]);
      });

      it('should fail when the number of lines exceeds a custom lines limit', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: ['div { display: none; }']
          })
          class Test {}
        `;
        const options: PropertyPairArray = [{ styles: 0 }];
        assertFailure(
          ruleName,
          source,
          {
            endPosition: { character: 45, line: 3 },
            message: getStylesFailure(1, options[0].styles),
            startPosition: { character: 21, line: 3 }
          },
          options
        );
      });
    });

    describe('success', () => {
      it('should succeed when the number of lines does not exceeds the default lines limit', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: ['div { display: none; }']
          })
          class Test {}
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed when a negative limit is used and the number of lines does not exceeds the default lines limit', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: ['div { display: none; }']
          })
          class Test {}
        `;
        const options: PropertyPairArray = [{ styles: -5 }];
        assertSuccess(ruleName, source, options);
      });
    });
  });

  describe('styleUrls', () => {
    it('should succeed when the number of lines of a styles file exceeds the default lines limit', () => {
      const source = `
        @Component({
          selector: 'foobar',
          styleUrls: ['./foobar.css']
        })
        class Test {}
      `;
      assertSuccess(ruleName, getSourceFile(source));
    });
  });

  describe('special cases', () => {
    it('should succeed when neither the styles nor the template are present', () => {
      const source = `
        @Component({
          selector: 'foobar',
          styleUrls: ['./foobar.scss'],
          templateUrl: './foobar.html'
        })
        class Test {}
      `;
      assertSuccess(ruleName, getSourceFile(source));
    });
  });
});
