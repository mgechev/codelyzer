import {assertFailure, assertSuccess, assertAnnotated} from './testHelper';

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
      message: 'Use @HostBindings and @HostListeners instead of the host property ($$06-03$$)',
      startPosition: {
        line: 2,
        character: 8
      },
      endPosition: {
        line: 4,
        character: 9
      }
    });
/*    assertAnnotated({
      ruleName: 'use-host-property-decorator',
      message: 'Use @HostBindings and @HostListeners instead of the host property ($$06-03$$)',
      source
    })*/
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
      message: 'Use @HostBindings and @HostListeners instead of the host property ($$06-03$$)',
      startPosition: {
        line: 2,
        character: 8
      },
      endPosition: {
        line: 4,
        character: 9
      }
    });
/*    assertAnnotated({
      ruleName: 'use-host-property-decorator',
      message: 'Use @HostBindings and @HostListeners instead of the host property ($$06-03$$)',
      source
    })*/
  });
});
