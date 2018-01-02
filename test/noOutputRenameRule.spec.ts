import { assertSuccess, assertAnnotated } from './testHelper';

describe('no-output-rename', () => {
  describe('invalid directive output property', () => {
    it('should fail, when a directive output property is renamed', () => {
      let source = `
      class ButtonComponent {
        @Output('changeEvent') change = new EventEmitter<any>();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }`;
      assertAnnotated({
        ruleName: 'no-output-rename',
        message: 'In the class "ButtonComponent", the directive output property "change" should not be renamed.' +
        'Please, consider the following use "@Output() change = new EventEmitter();"',
        source
      });
    });
  });

  describe('valid directive output property', () => {
    it('should succeed, when a directive output property is properly used', () => {
      let source = `
      class ButtonComponent {
         @Output() change = new EventEmitter<any>();
      }`;
      assertSuccess('no-output-rename', source);
    });

    it('should succeed, when a directive output property rename is the same as the property name', () => {
      let source = `
      class ButtonComponent {
         @Output('change') change = new EventEmitter<any>();
      }`;
      assertSuccess('no-output-rename', source);
    });
  });
});
