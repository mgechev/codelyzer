import { createSourceFile, ScriptTarget, SourceFile } from 'typescript/lib/typescript';
import { getAnimationsFailure, getStylesFailure, getTemplateFailure, PropertyPair, Rule } from '../src/componentMaxInlineDeclarationsRule';
import { assertFailure, assertFailures, assertSuccess } from './testHelper';

type PropertyPairArray = ReadonlyArray<PropertyPair>;

const {
  metadata: { ruleName },
} = Rule;
const filePath = `${__dirname}/../../test/fixtures/inlineTemplateMaxLines/foo.ts`;

const getSourceFile = (code: string): SourceFile => createSourceFile(filePath, code, ScriptTarget.ES2015, true);

describe(ruleName, () => {
  describe('animations', () => {
    describe('failure', () => {
      it('should fail if the number of lines exceeds the default lines limit', () => {
        const source = `
          @Component({
            animations: [
              \`
                transformPanel: trigger('transformPanel',
                  [
                    state('void', style({opacity: 0, transform: 'scale(1, 0)'})),
                    state('enter', style({opacity: 1, transform: 'scale(1, 1)'})),
                    transition('void => enter', group([
                      query('@fadeInCalendar', animateChild()),
                      animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')
                    ])),
                    transition('* => void', animate('100ms linear', style({opacity: 0})))
                  ]
                ),

                fadeInCalendar: trigger('fadeInCalendar', [
                  state('void', style({opacity: 0})),
                  state('enter', style({opacity: 1})),
                  transition('void => *', animate('400ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)'))
                ]
              \`;
            ]
          })
          class Test {}
        `;
        assertFailure(ruleName, source, {
          endPosition: { character: 15, line: 21 },
          message: getAnimationsFailure(17),
          startPosition: { character: 14, line: 3 },
        });
      });

      it('should fail if the number of lines exceeds a custom lines limit', () => {
        const source = `
          @Component({
            animations: [
              \`
                transformPanel: trigger('transformPanel',
                  [
                    state('void', style({opacity: 0, transform: 'scale(1, 0)'}))
                  ]
                )
              \`
            ]
          })
          class Test {}
        `;
        const options: PropertyPairArray = [{ animations: 2 }];
        assertFailure(
          ruleName,
          source,
          {
            endPosition: { character: 15, line: 9 },
            message: getAnimationsFailure(5, options[0].animations),
            startPosition: { character: 14, line: 3 },
          },
          options
        );
      });
    });

    describe('success', () => {
      it('should succeed if the number of lines does not exceeds the default lines limit', () => {
        const source = `
          @Component({
            animations: ['state('void', style({opacity: 0, transform: 'scale(1, 0)'}))']
          })
          class Test {}
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a negative limit is used and the number of lines does not exceeds the default lines limit', () => {
        const source = `
          @Component({
            animations: ['state('void', style({opacity: 0, transform: 'scale(1, 0)'}))']
          })
          class Test {}
        `;
        const options: PropertyPairArray = [{ animations: -5 }];
        assertSuccess(ruleName, source, options);
      });
    });
  });

  describe('styles', () => {
    describe('failure', () => {
      it('should fail if the number of lines exceeds the default lines limit', () => {
        const source = `
          @Component({
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
          endPosition: { character: 15, line: 8 },
          message: getStylesFailure(4),
          startPosition: { character: 14, line: 3 },
        });
      });

      it('should fail if the sum of lines (from separate inline styles) exceeds the default lines limit', () => {
        const source = `
          @Component({
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
            endPosition: { character: 15, line: 8 },
            message,
            startPosition: { character: 14, line: 3 },
          },
          {
            endPosition: { character: 15, line: 14 },
            message,
            startPosition: { character: 14, line: 9 },
          },
        ]);
      });

      it('should fail if the number of lines exceeds a custom lines limit', () => {
        const source = `
          @Component({
            styles: ['div { display: none; }']
          })
          class Test {}
        `;
        const options: PropertyPairArray = [{ styles: 0 }];
        assertFailure(
          ruleName,
          source,
          {
            endPosition: { character: 45, line: 2 },
            message: getStylesFailure(1, options[0].styles),
            startPosition: { character: 21, line: 2 },
          },
          options
        );
      });
    });

    describe('success', () => {
      it('should succeed if the number of lines does not exceeds the default lines limit', () => {
        const source = `
          @Component({
            styles: ['div { display: none; }']
          })
          class Test {}
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a negative limit is used and the number of lines does not exceeds the default lines limit', () => {
        const source = `
          @Component({
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
    it('should succeed if the number of lines of a styles file exceeds the default lines limit', () => {
      const source = `
        @Component({
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
          styleUrls: ['./foobar.scss'],
          templateUrl: './foobar.html'
        })
        class Test {}
      `;
      assertSuccess(ruleName, getSourceFile(source));
    });
  });

  describe('template', () => {
    describe('failure', () => {
      it('should fail if the number of lines exceeds the default lines limit', () => {
        const source = `
          @Component({
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
          endPosition: { character: 13, line: 7 },
          message: getTemplateFailure(4),
          startPosition: { character: 22, line: 2 },
        });
      });

      it('should fail if the number of lines exceeds a custom lines limit', () => {
        const source = `
          @Component({
            template: '<div>first line</div>'
          })
          class Test {}
        `;
        const options: PropertyPairArray = [{ template: 0 }];
        assertFailure(
          ruleName,
          source,
          {
            endPosition: { character: 45, line: 2 },
            message: getTemplateFailure(1, options[0].template),
            startPosition: { character: 22, line: 2 },
          },
          options
        );
      });
    });

    describe('success', () => {
      it('should succeed if the number of lines does not exceeds the default lines limit', () => {
        const source = `
          @Component({
            template: '<div>just one line template</div>'
          })
          class Test {}
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if a negative limit is used and the number of lines does not exceeds the default lines limit', () => {
        const source = `
          @Component({
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
    it('should succeed if the number of lines of a template file exceeds the default lines limit', () => {
      const source = `
        @Component({
          templateUrl: './foobar.html'
        })
        class Test {}
      `;
      assertSuccess(ruleName, getSourceFile(source));
    });
  });
});
