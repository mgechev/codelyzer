import {assertFailure} from './testHelper';

describe('component-selector', () => {
  it('should fail when "inputs" is used', () => {
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
});
