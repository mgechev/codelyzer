import { assertSuccess, assertAnnotated } from './testHelper';

describe('no-input-prefix', () => {
  describe('invalid directive input property', () => {
    it('should fail, when a component input property is named with is prefix', () => {
      const source = `
      @Component()
      class ButtonComponent {
        @Input() isDisabled: boolean;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }`;
      assertAnnotated({
        ruleName: 'no-input-prefix',
        options: ['is'],
        message: 'In the class "ButtonComponent", the input property "isDisabled" should not be prefixed with is',
        source
      });
    });

    it('should fail, when a directive input property is named with is prefix', () => {
      const source = `
      @Directive()
      class ButtonDirective {
        @Input() isDisabled: boolean;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }`;
      assertAnnotated({
        ruleName: 'no-input-prefix',
        options: ['is'],
        message: 'In the class "ButtonDirective", the input property "isDisabled" should not be prefixed with is',
        source
      });
    });

    it('should fail, when a directive input property is named with is prefix', () => {
      const source = `
      @Directive()
      class ButtonDirective {
        @Input() mustDisable: string;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }`;
      assertAnnotated({
        ruleName: 'no-input-prefix',
        options: ['must'],
        message: 'In the class "ButtonDirective", the input property "mustDisable" should not be prefixed with must',
        source
      });
    });

    it('should fail, when a directive input property is named with is prefix', () => {
      const source = `
      @Directive()
      class ButtonDirective {
        @Input() is = true;
        ~~~~~~~~~~~~~~~~~~~
      }`;
      assertAnnotated({
        ruleName: 'no-input-prefix',
        options: ['is'],
        message: 'In the class "ButtonDirective", the input property "is" should not be prefixed with is',
        source
      });
    });

    it('should fail, when a directive input property is named with can prefix', () => {
      const source = `
      @Directive()
      class ButtonDirective {
        @Input() canEnable = true;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~
      }`;
      assertAnnotated({
        ruleName: 'no-input-prefix',
        options: ['can', 'is'],
        message: 'In the class "ButtonDirective", the input property "canEnable" should not be prefixed with can, is',
        source
      });
    });
  });

  describe('valid directive input property', () => {
    it('should succeed, when a directive input property is properly named', () => {
      const source = `
      @Directive()
      class ButtonComponent {
         @Input() disabled = true;
      }`;
      assertSuccess('no-input-prefix', source);
    });

    it('should succeed, when a directive input property is properly named', () => {
      const source = `
        @Directive()
        class ButtonComponent {
           @Input() disabled = "yes";
        }`;
      assertSuccess('no-input-prefix', source);
    });

    it('should succeed, when a component input property is properly named with is', () => {
      const source = `
      @Component()
      class ButtonComponent {
         @Input() isometric: boolean;
      }`;
      assertSuccess('no-input-prefix', source);
    });
  });
});
