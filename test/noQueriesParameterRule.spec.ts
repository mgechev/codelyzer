import { Rule } from '../src/noQueriesParameterRule';
import { assertAnnotated, assertSuccess } from './testHelper';

type MetadataType = 'Component' | 'Directive';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;
const metadataTypes = new Set<MetadataType>(['Component', 'Directive']);

describe(ruleName, () => {
  metadataTypes.forEach(metadataType => {
    describe(metadataType, () => {
      describe('failure', () => {
        it('should fail when "queries" is used', () => {
          const source = `
            @${metadataType}({
              queries: {
              ~~~~~~~~
                contentChildren: new ContentChildren(ChildDirective),
                viewChildren: new ViewChildren(ChildDirective)
              }
              ~
            })
            class Test {}
          `;
          assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });
        });

        it('should fail when "queries" is used', () => {
          const source = `
            @${metadataType}({
              queries: {
              ~~~~~~~~
                contentChild: new ContentChild(ChildDirective),
                viewChild: new ViewChild(ChildDirective)
              }
              ~
            })
            class Test {}
          `;
          assertAnnotated({ message: FAILURE_STRING, ruleName, source });
        });
      });
      describe('success', () => {
        it('should succeed when "queries" is not used', () => {
          const source = `
            @${metadataType}({})
            class Test {}
          `;
          assertSuccess(ruleName, source);
        });

        it('should succeed when content decorators are used', () => {
          const source = `
            @${metadataType}({})
            class Test {
              @ContentChild(ChildDirective) contentChild: ChildDirective;
            }
          `;
          assertSuccess(ruleName, source);
        });
      });
    });
  });
});
