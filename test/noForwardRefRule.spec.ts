import { assertAnnotated, assertSuccess } from './testHelper';

describe('no-forward-ref', () => {
  describe('invalid function call', () => {
    it('should fail when we are calling forwardRef in constructor', () => {
      let source = `
      class Test {
        constructor(@Inject(forwardRef(()=>NameService)) nameService) {}
                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      class NameService {}`;
      assertAnnotated({
        ruleName: 'no-forward-ref',
        message: 'Avoid using forwardRef in class "Test"',
        source
      });
    });

    it('should fail when we are calling forwardRef in Component directives array', () => {
      let source = `
      @Component({
        directives: [forwardRef(()=>NameService)]
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
      class NameService {}`;
      assertAnnotated({
        ruleName: 'no-forward-ref',
        message: 'Avoid using forwardRef in class "Test"',
        source
      });
    });

    it('should fail when we are calling forwardRef in variable', () => {
      let source = `
      const TAGS_INPUT_CONTROL_VALUE_ACCESSOR = new Provider(
          NG_VALUE_ACCESSOR, {
            useExisting: forwardRef(() => TagsInput),
                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~
            multi: true
      });`;
      assertAnnotated({
        ruleName: 'no-forward-ref',
        message: 'Avoid using forwardRef in variable "TAGS_INPUT_CONTROL_VALUE_ACCESSOR"',
        source
      });
    });
  });
  it('should work with NG_VALUE_ACCESSORs', () => {
    let source = `const CUSTOM_VALUE_ACCESSOR = new Provider(
    NG_VALUE_ACCESSOR, { useExisting: forwardRef(() => CountryListValueAccessor)});
                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `;
    assertAnnotated({
      ruleName: 'no-forward-ref',
      message: 'Avoid using forwardRef in variable "CUSTOM_VALUE_ACCESSOR"',
      source
    });
  });
  describe('valid function call', () => {
    it('should succeed, when we are not calling forwardRef', () => {
      let source = `
      class Test {
        constructor() {
          this.test();
        }
        test(){
        }
      }`;
      assertSuccess('no-forward-ref', source);
    });
  });
});
