import {assertFailure, assertSuccess} from './testHelper';

describe('no-forward-ref', () => {
  describe('invalid function call', ()=> {
    it('should fail when we are calling forwardRef in constructor', () => {
      let source = `
      class Test {
        constructor(@Inject(forwardRef(()=>NameService)) nameService) {}
      }
      class NameService {}`;
      assertFailure('no-forward-ref', source, {
        message: 'Avoid using forwardRef in class "Test"',
        startPosition: {
          line: 2,
          character: 28
        },
        endPosition: {
          line: 2,
          character: 55
        }
      });
    });

    it('should fail when we are calling forwardRef in Component directives array', () => {
      let source = `
      @Component({
        directives: [forwardRef(()=>NameService)]
      })
      class Test {}
      class NameService {}`;
      assertFailure('no-forward-ref', source, {
        message: 'Avoid using forwardRef in class "Test"',
        startPosition: {
          line: 2,
          character: 21
        },
        endPosition: {
          line: 2,
          character: 48
        }
      });
    });

    it('should fail when we are calling forwardRef in variable', () => {
      let source = `
      const TAGS_INPUT_CONTROL_VALUE_ACCESSOR = new Provider(
          NG_VALUE_ACCESSOR, {
            useExisting: forwardRef(() => TagsInput),
            multi: true
      });`;
      assertFailure('no-forward-ref', source, {
        message: 'Avoid using forwardRef in variable "TAGS_INPUT_CONTROL_VALUE_ACCESSOR"',
        startPosition: {
          line: 3,
          character: 25
        },
        endPosition: {
          line: 3,
          character: 52
        }
      });
    });
  });
  it('should work with NG_VALUE_ACCESSORs', () => {
    let source = `const CUSTOM_VALUE_ACCESSOR = new Provider(
    NG_VALUE_ACCESSOR, { useExisting: forwardRef(() => CountryListValueAccessor)});`;
    assertFailure('no-forward-ref', source, {
      message: 'Avoid using forwardRef in variable "CUSTOM_VALUE_ACCESSOR"',
      startPosition: {
        line: 1,
        character: 38
      },
      endPosition: {
        line: 1,
        character: 80
      }
    });
  });
  describe('valid function call', ()=> {
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
  })
});
