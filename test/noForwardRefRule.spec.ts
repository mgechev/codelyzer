import { Rule } from '../src/noForwardRefRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING_CLASS,
  FAILURE_STRING_VARIABLE,
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    describe('class', () => {
      it('should fail if forwardRef is called in constructor', () => {
        const source = `
          @Component({
            selector: 'test',
            template: ''
          })
          export class Test {
            constructor(@Inject(forwardRef(() => TestService)) testService) {}
                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
          export class TestService {}
        `;
        assertAnnotated({
          message: FAILURE_STRING_CLASS,
          ruleName,
          source
        });
      });

      it('should fail if forwardRef is called in a metadata property', () => {
        const source = `
          @Component({
            providers: [
              {
                multi: true,
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => TagsValueAccessor)
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              }
            ],
            selector: '[tags]',
          })
          export class TagsValueAccessor {}
        `;
        assertAnnotated({
          message: FAILURE_STRING_CLASS,
          ruleName,
          source
        });
      });
    });

    describe('variable', () => {
      it('should fail if forwardRef is called in a variable declaration', () => {
        const source = `
          const TAGS_VALUE_ACCESSOR: StaticProvider = {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TagsValueAccessor)
                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          };
          @Directive({
            providers: [TAGS_VALUE_ACCESSOR],
            selector: '[tags]'
          })
          export class TagsValueAccessor {}
        `;
        assertAnnotated({
          message: FAILURE_STRING_VARIABLE,
          ruleName,
          source
        });
      });
    });
  });

  describe('success', () => {
    it('should succeed if forwardRef is not called', () => {
      const source = `
        @Component({
          selector: 'test',
          template: ''
        })
        export class Test {
          constructor() {
            this.test();
          }

          test() {}
        }
      `;
      assertSuccess(ruleName, source);
    });
  });
  describe('A class without name', () => {
    it('should not broke the linter', () => {
      let source = 'export default class {}';
      assertSuccess(ruleName, source);
    });
  });
});
