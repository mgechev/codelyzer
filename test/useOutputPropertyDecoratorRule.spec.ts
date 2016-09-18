import {assertFailure, assertSuccess} from './testHelper';

describe('use-output-property-decorator', () => {
  it('should fail when "outputs" is used in @Component', () => {
    let source = `
      @Component({
        outputs: [
          'id: foo'
        ]
      })
      class Bar {}
    `;
    assertFailure('use-output-property-decorator', source, {
      message: 'Use the @Output property decorator instead of the outputs property ($$05-12$$)',
      startPosition: {
        line: 2,
        character: 8
      },
      endPosition: {
        line: 4,
        character: 9
      }
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
          'id: foo'
        ]
      })
      class Baz {}
    `;
    assertFailure('use-output-property-decorator', source, {
      message: 'Use the @Output property decorator instead of the outputs property ($$05-12$$)',
      startPosition: {
        line: 2,
        character: 8
      },
      endPosition: {
        line: 4,
        character: 9
      }
    });
  });
});
