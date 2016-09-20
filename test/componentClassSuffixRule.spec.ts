import {assertFailure, assertSuccess} from './testHelper';

describe('component-class-suffix', () => {
    describe('invalid component class suffix', () => {
        it('should fail when component class is with the wrong suffix', () => {
              let source = `
              @Component({
                selector: 'sg-foo-bar'
              })
              class Test {}`;
            assertFailure('component-class-suffix', source, {
                message: 'The name of the class Test should end with the suffix Component ($$02-03$$)',
                startPosition: {
                    line: 4,
                    character: 20
                },
                endPosition: {
                    line: 4,
                    character: 24
                }
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
            class TestComponent {}`;
            assertSuccess('component-class-suffix', source);
        });
    });

    describe('valid directive class', () => {
        it('should succeed when is used @Directive decorator', () => {
            let source = `
            @Directive({
                selector: '[myHighlight]'
            })
            class TestDirective {}`;
            assertSuccess('component-class-suffix', source);
        });
    });

    describe('valid pipe class', () => {
        it('should succeed when is used @Pipe decorator', () => {
            let source = `
            @Pipe({
                selector: 'sg-test-pipe'
            })
            class TestPipe {}`;
            assertSuccess('component-class-suffix', source);
        });
    });

    describe('valid service class', () => {
        it('should succeed when is used @Injectable decorator', () => {
            let source = `
            @Injectable()
            class TestService {}`;
            assertSuccess('component-class-suffix', source);
        });
    });

    describe('valid empty class', () => {
        it('should succeed when the class is empty', () => {
            let source = `
            class TestEmpty {}`;
            assertSuccess('component-class-suffix', source);
        });
    });
});
