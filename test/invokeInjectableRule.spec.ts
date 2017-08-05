import { assertSuccess, assertAnnotated } from './testHelper';

describe('invoke-injectable', () => {
  describe('success', () => {
    it('should not fail when no decorator is set', () => {
      let source = 'class Foobar {}';
      assertSuccess('invoke-injectable', source);
    });

    it('should not fail when different decorator is used', () => {
      let source = `
        @Component()
        @Wove
        class Foobar {
          foo() {}
        }
      `;
      assertSuccess('invoke-injectable', source);
    });

    it('should not fail when injectable is invoked', () => {
      let source = `
        @Injectable()
        class Foobar {
          foo() {}
        }
      `;
      assertSuccess('invoke-injectable', source);
    });

  });

  describe('failure', () => {

    it('should fail when injectable is not invoked', () => {
      let source = `
        @Injectable
        ~~~~~~~~~~~
        class Foobar {
          foo() {}
        }
      `;
      assertAnnotated({
        ruleName: 'invoke-injectable',
        message: 'You have to invoke @Injectable()',
        source
      });
    });

    it('should fail when injectable is not invoked and multiple decorators are used', () => {
      let source = `
        @Injectable
        ~~~~~~~~~~~
        @Component()
        class Foobar {
          foo() {}
        }
      `;
      assertAnnotated({
        ruleName: 'invoke-injectable',
        message: 'You have to invoke @Injectable()',
        source
      });
    });

  });
});

