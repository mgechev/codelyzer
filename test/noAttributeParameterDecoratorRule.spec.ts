import {assertFailure, assertSuccess} from './testHelper';

describe('no-attribute-parameter-decorator', () => {
  describe('invalid parameter decorator', () => {
    it(`should fail, when it's used attribute decorator`, () => {
       let source = `
       class ButtonComponent {
        label: string;
        constructor(@Attribute('label') label) {
          this.label = label;
        }
       }`;
       assertFailure('no-attribute-parameter-decorator', source, {
         message: 'In the constructor of class "ButtonComponent", the parameter "label" uses the @Attribute decorator, ' +
       'which is considered as a bad practice. Please, consider construction of type "@Input() label: string"',
         startPosition: {
           line: 3,
           character: 20
         },
         endPosition: {
           line: 3,
           character: 45
         }
      });
    });
  });
  describe('valid class constructor', () => {
    it('should succeed, when is not used attribute decorator', () => {
      let source = `
      class ButtonComponent {
        constructor(){}
      }`;
      assertSuccess('no-attribute-parameter-decorator', source);
    });
  });
});
