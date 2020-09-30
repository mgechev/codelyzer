import { assertSuccess, assertAnnotated } from './testHelper';

describe('component-class-suffix', () => {
  describe('invalid component class suffix', () => {
    it('should fail when component class is with the wrong suffix', () => {
      let source = `
        @Component({
          selector: 'sg-foo-bar'
        })
        class Test {}
              ~~~~
      `;
      assertAnnotated({
        ruleName: 'component-class-suffix',
        message: 'The name of the class Test should end with the suffix Component (https://angular.io/styleguide#style-02-03)',
        source,
      });
    });
  });

  describe('valid component class name', () => {
    it('should succeed when the component class name ends with Component', () => {
      let source = `
        @Component({
          selector: 'sg-foo-bar',
          template: '<foo-bar [foo]="bar">{{baz + 42}}</foo-bar>'
        })
        class TestComponent {}
      `;
      assertSuccess('component-class-suffix', source);
    });
  });

  describe('valid directive class', () => {
    it('should succeed when is used @Directive decorator', () => {
      let source = `
        @Directive({
          selector: '[myHighlight]'
        })
        class TestDirective {}
      `;
      assertSuccess('component-class-suffix', source);
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
      assertSuccess('component-class-suffix', source);
    });
  });

  describe('valid service class', () => {
    it('should succeed when is used @Injectable decorator', () => {
      let source = `
        @Injectable()
        class TestService {}
      `;
      assertSuccess('component-class-suffix', source);
    });
  });

  describe('valid empty class', () => {
    it('should succeed when the class is empty', () => {
      let source = `
        class TestEmpty {}
      `;
      assertSuccess('component-class-suffix', source);
    });
  });

  describe('changed suffix', () => {
    it('should succeed when different suffix is set', () => {
      let source = `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
      `;
      assertSuccess('component-class-suffix', source, ['Page']);
    });

    it('should succeed when different list of suffix is set', () => {
      let source = `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
      `;
      assertSuccess('component-class-suffix', source, ['Page', 'View']);
    });

    it('should fail when different list of suffix is set and doesnt match', () => {
      let source = `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
              ~~~~~~~~
      `;
      assertAnnotated({
        ruleName: 'component-class-suffix',
        message:
          'The name of the class TestPage should end with the suffix Component,View' + ' (https://angular.io/styleguide#style-02-03)',
        source,
        options: ['Component', 'View'],
      });
    });

    it('should fail when different sufix is set and doesnt match', () => {
      let source = `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
              ~~~~~~~~
      `;
      assertAnnotated({
        ruleName: 'component-class-suffix',
        message: 'The name of the class TestPage should end with the suffix Component (https://angular.io/styleguide#style-02-03)',
        source,
        options: ['Component'],
      });
    });

    it('should fail when different sufix is set and doesnt match', () => {
      let source = `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestDirective {}
              ~~~~~~~~~~~~~
      `;
      assertAnnotated({
        ruleName: 'component-class-suffix',
        message: 'The name of the class TestDirective should end with the suffix Page (https://angular.io/styleguide#style-02-03)',
        source,
        options: ['Page'],
      });
    });
  });
});
