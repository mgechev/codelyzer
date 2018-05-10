import { assertSuccess, assertAnnotated } from './testHelper';

describe('no-output-named-after-standard-event', () => {
  describe('invalid directive output property', () => {
    it('should fail, when component output property is named "change"', () => {
      const source = `
        @Component()
        class ButtonComponent {
          @Output() change = new EventEmitter<any>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({
        ruleName: 'no-output-named-after-standard-event',
        message: 'In the class "ButtonComponent", the output property "change" should not be named or renamed after a standard event',
        source
      });
    });

    it('should fail, when directive output property is named "change"', () => {
      const source = `
        @Directive()
        class ButtonDirective {
          @Output() change = new EventEmitter<any>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({
        ruleName: 'no-output-named-after-standard-event',
        message: 'In the class "ButtonDirective", the output property "change" should not be named or renamed after a standard event',
        source
      });
    });

    it('should fail, when component output property is renamed to "change"', () => {
      const source = `
        @Component()
        class ButtonComponent {
          @Output("change") _change = new EventEmitter<any>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({
        ruleName: 'no-output-named-after-standard-event',
        message: 'In the class "ButtonComponent", the output property "_change" should not be named or renamed after a standard event',
        source
      });
    });

    it('should fail, when directive output property is renamed to "change"', () => {
      const source = `
        @Directive()
        class ButtonDirective {
          @Output("change") _change = new EventEmitter<any>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({
        ruleName: 'no-output-named-after-standard-event',
        message: 'In the class "ButtonDirective", the output property "_change" should not be named or renamed after a standard event',
        source
      });
    });
  });

  describe('valid directive output property', () => {
    it('should succeed, when a component output property is properly named', () => {
      const source = `
        @Component()
        class ButtonComponent {
          @Output() buttonChange = new EventEmitter<any>();
        }
      `;
      assertSuccess('no-output-named-after-standard-event', source);
    });

    it('should succeed, when a directive output property is properly named', () => {
      const source = `
        @Directive()
        class ButtonDirective {
          @Output() buttonChange = new EventEmitter<any>();
        }
      `;
      assertSuccess('no-output-named-after-standard-event', source);
    });

    it('should succeed, when a component output property is properly renamed', () => {
      const source = `
        @Component()
        class ButtonComponent {
          @Output("buttonChange") _buttonChange = new EventEmitter<any>();
        }
      `;
      assertSuccess('no-output-named-after-standard-event', source);
    });

    it('should succeed, when a directive output property is properly renamed', () => {
      const source = `
        @Directive()
        class ButtonDirective {
          @Output("buttonChange") _buttonChange = new EventEmitter<any>();
        }
      `;
      assertSuccess('no-output-named-after-standard-event', source);
    });
  });
});
