import { assertSuccess, assertAnnotated } from './testHelper';

describe('no-output-on-prefix', () => {
  describe('invalid directive output property', () => {
    it('should fail, when a component output property is named with on prefix', () => {
      const source = `
      @Component()
      class ButtonComponent {
        @Output() onChange = new EventEmitter<any>();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }`;
      assertAnnotated({
        ruleName: 'no-output-on-prefix',
        message: 'In the class "ButtonComponent", the output property "onChange" should not be prefixed with on',
        source
      });
    });

    it('should fail, when a directive output property is named with on prefix', () => {
      const source = `
      @Directive()
      class ButtonDirective {
        @Output() onChange = new EventEmitter<any>();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }`;
      assertAnnotated({
        ruleName: 'no-output-on-prefix',
        message: 'In the class "ButtonDirective", the output property "onChange" should not be prefixed with on',
        source
      });
    });

  });

  describe('valid directive output property', () => {
    it('should succeed, when a directive output property is properly named', () => {
      const source = `
      @Component()
      class ButtonComponent {
         @Output() change = new EventEmitter<any>();
      }`;
      assertSuccess('no-output-on-prefix', source);
    });
  });
});
