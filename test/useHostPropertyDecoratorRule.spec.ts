import {assertFailure, assertSuccess} from './testHelper';

describe('use-host-property-decorator', () => {
  it('should fail when "host" is used in @Component', () => {
    let source = `
      @Component({
        host: {
          '(click)': 'bar()'
        }
      })
      class Bar {}
    `;
    assertFailure('use-host-property-decorator', source, {
      message: 'In the "@Component" class decorator of the class "Bar" you are using the "host" property, this is considered bad practice. Use "@HostBindings", "@HostListeners" property decorator instead.',
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
  it('should succeed when "host" is not used', () => {
    let source = `
      @Component({
        selector: 'baz'
      })
      class Bar {}
    `;
    assertSuccess('use-host-property-decorator', source);
  });
  it('should fail when "host" is used in @Directive', () => {
    let source = `
      @Directive({
        host: {
          '(click)': 'bar()'
        }
      })
      class Baz {}
    `;
    assertFailure('use-host-property-decorator', source, {
      message: 'In the "@Directive" class decorator of the class "Baz" you are using the "host" property, this is considered bad practice. Use "@HostBindings", "@HostListeners" property decorator instead.',
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
