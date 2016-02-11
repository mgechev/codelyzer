import {assertFailure, assertSuccess} from './testHelper';

describe('input-parameter-decorator', () => {
  it('should fail when "inputs" is used in @Component', () => {
    let source = `
      @Component({
        inputs: [
          'id: foo'
        ]
      })
      class Bar {}
    `;
    assertFailure('input-parameter-decorator', source, {
      message: 'In the "@Component" class decorator of the class "Bar" you are using the "inputs" property, this is considered bad practice. Use "@Input" property decorator instead.',
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
  it('should succeed when "inputs" is not used', () => {
    let source = `
      @Component({
        selector: 'baz'
      })
      class Bar {}
    `;
    assertSuccess('input-parameter-decorator', source);
  });
  it('should fail when "inputs" is used in @Directive', () => {
    let source = `
      @Directive({
        inputs: [
          'id: foo'
        ]
      })
      class Baz {}
    `;
    assertFailure('input-parameter-decorator', source, {
      message: 'In the "@Directive" class decorator of the class "Baz" you are using the "inputs" property, this is considered bad practice. Use "@Input" property decorator instead.',
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
