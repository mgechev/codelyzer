import { assertSuccess, assertAnnotated } from './testHelper';

describe('use-host-property-decorator', () => {
  it('should fail when "host" is used in @Component', () => {
    let source = `
      @Component({
        host: {
        ~~~~~~~
          '(click)': 'bar()'
        }
        ~
      })
      class Bar {}
    `;
    assertAnnotated({
      ruleName: 'use-host-property-decorator',
      message: 'Use @HostBindings and @HostListeners instead of the host property (https://angular.io/styleguide#style-06-03)',
      source
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
        ~~~~~~~
          '(click)': 'bar()'
        }
        ~
      })
      class Baz {}
    `;
    assertAnnotated({
      ruleName: 'use-host-property-decorator',
      message: 'Use @HostBindings and @HostListeners instead of the host property (https://angular.io/styleguide#style-06-03)',
      source
    });
  });
});
