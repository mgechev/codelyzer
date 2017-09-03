import { assertSuccess, assertAnnotated } from './testHelper';

describe('use-output-property-decorator', () => {
  it('should fail when "outputs" is used in @Component', () => {
    let source = `
      @Component({
        outputs: [
        ~~~~~~~~~~
          'id: foo'
        ]
        ~
      })
      class Bar {}
    `;
    assertAnnotated({
      ruleName: 'use-output-property-decorator',
      message: 'Use the @Output property decorator instead of the outputs property (https://angular.io/styleguide#style-05-12)',
      source
    });
  });

  it('should succeed when "outputs" is not used', () => {
    let source = `
      @Component({
        selector: 'baz'
      })
      class Bar {}
    `;
    assertSuccess('use-output-property-decorator', source);
  });

  it('should fail when "outputs" is used in @Directive', () => {
    let source = `
      @Directive({
        outputs: [
        ~~~~~~~~~~
          'id: foo'
        ]
        ~
      })
      class Baz {}
    `;
    assertAnnotated({
      ruleName: 'use-output-property-decorator',
      message: 'Use the @Output property decorator instead of the outputs property (https://angular.io/styleguide#style-05-12)',
      source
    });
  });
});
