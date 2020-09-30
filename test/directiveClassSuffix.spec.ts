import { assertAnnotated, assertSuccess } from './testHelper';

describe('directive-class-suffix', () => {
  describe('invalid directive class suffix', () => {
    it('should fail when directive class is with the wrong suffix', () => {
      let source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class Test {}
              ~~~~
      `;
      assertAnnotated({
        ruleName: 'directive-class-suffix',
        message: 'The name of the class Test should end with the suffix Directive (https://angular.io/styleguide#style-02-03)',
        source,
      });
    });

    it('should fail when directive class is with the wrong suffix', () => {
      let source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class Test {}
              ~~~~
      `;
      assertAnnotated({
        ruleName: 'directive-class-suffix',
        message:
          'The name of the class Test should end with the suffix ' +
          'Directive, Page, Validator (https://angular.io/styleguide#style-02-03)',
        source,
        options: ['Directive', 'Page', 'Validator'],
      });
    });
  });

  describe('valid directive class name', () => {
    it('should succeed when the directive class name ends with Directive', () => {
      let source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestDirective {}
      `;
      assertSuccess('directive-class-suffix', source);
    });

    it('should succeed when the directive class name ends with Validator and implements Validator', () => {
      const source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestValidator implements Validator {}
      `;
      assertSuccess('directive-class-suffix', source);
    });

    it('should succeed when the directive class name ends with Validator and implements AsyncValidator', () => {
      const source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestValidator implements AsyncValidator {}
      `;
      assertSuccess('directive-class-suffix', source);
    });
  });

  describe('not called decorator', () => {
    it('should not fail when @Directive is not called', () => {
      let source = `
        @Directive
        class TestDirective {}
      `;
      assertSuccess('directive-class-suffix', source);
    });
  });

  describe('valid directive class', () => {
    it('should succeed when is used @Component decorator', () => {
      let source = `
        @Component({
            selector: 'sg-foo-bar'
        })
        class TestComponent {}
      `;
      assertSuccess('directive-class-suffix', source);
    });
  });

  describe('valid pipe class', () => {
    it('should succeed when is used @Pipe decorator', () => {
      let source = `
        @Pipe({
            selector: 'sg-test-pipe'
        })
        class TestPipe {}
      `;
      assertSuccess('directive-class-suffix', source);
    });
  });

  describe('valid service class', () => {
    it('should succeed when is used @Injectable decorator', () => {
      let source = `
        @Injectable()
        class TestService {}
      `;
      assertSuccess('directive-class-suffix', source);
    });
  });

  describe('valid empty class', () => {
    it('should succeed when the class is empty', () => {
      let source = `
        class TestEmpty {}
      `;
      assertSuccess('directive-class-suffix', source);
    });
  });

  describe('changed suffix', () => {
    it('should suceed when different sufix is set', () => {
      let source = `
        @Directive({
            selector: 'sgBarFoo'
        })
        class TestPage {}
      `;
      assertSuccess('directive-class-suffix', source, ['Page']);
    });

    it('should fail when different sufix is set and doesnt match', () => {
      let source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestPage {}
              ~~~~~~~~
      `;
      assertAnnotated({
        ruleName: 'directive-class-suffix',
        message: 'The name of the class TestPage should end with the suffix Directive (https://angular.io/styleguide#style-02-03)',
        source,
        options: ['Directive'],
      });
    });

    it('should fail when different sufix is set and doesnt match', () => {
      let source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestDirective {}
              ~~~~~~~~~~~~~
      `;
      assertAnnotated({
        ruleName: 'directive-class-suffix',
        message: 'The name of the class TestDirective should end with the suffix Page (https://angular.io/styleguide#style-02-03)',
        source,
        options: ['Page'],
      });
    });
  });
});
