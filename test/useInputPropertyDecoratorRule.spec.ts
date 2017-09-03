import { assertSuccess, assertAnnotated } from './testHelper';

describe('use-input-property-decorator', () => {
  it('should fail when "inputs" is used in @Component', () => {
    let source = `
      @Component({
        inputs: [
        ~~~~~~~~~
          'id: foo'
        ]
        ~
      })
      class Bar {}
    `;
    assertAnnotated({
      ruleName: 'use-input-property-decorator',
      message: 'Use the @Input property decorator instead of the inputs property (https://angular.io/styleguide#style-05-12)',
      source
    });
  });

  it('should succeed when "inputs" is not used', () => {
    let source = `
      @Component({
        selector: 'baz'
      })
      class Bar {}
    `;
    assertSuccess('use-input-property-decorator', source);
  });

  it('should fail when "inputs" is used in @Directive', () => {
    let source = `
      @Directive({
        inputs: [
        ~~~~~~~~~
          'id: foo'
        ]
        ~
      })
      class Baz {}
    `;
    assertAnnotated({
      ruleName: 'use-input-property-decorator',
      message: 'Use the @Input property decorator instead of the inputs property (https://angular.io/styleguide#style-05-12)',
      source
    });
  });
});
