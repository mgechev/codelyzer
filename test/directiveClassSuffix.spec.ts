import {assertFailure, assertSuccess} from './testHelper';

describe('directive-class-suffix', () => {
    describe('invalid directive class suffix', () => {
        it('should fail when directive class is with the wrong suffix', () => {
            let source = `
              @Directive({
                selector: 'sgBarFoo'
              })
              class Test {}`;
            assertFailure('directive-class-suffix', source, {
                message: 'The name of the class Test should end with the suffix Directive (https://goo.gl/dWO74s)',
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
    describe('valid directive class name', () => {
        it('should succeed when the directive class name ends with Directive', () => {
            let source = `
            @Directive({
                selector: 'sgBarFoo'
            })
            class TestDirective {}`;
            assertSuccess('directive-class-suffix', source);
        });
    });
    describe('valid directive class', () => {
        it('should succeed when is used @Component decorator', () => {
            let source = `
            @Component({
                selector: 'sg-foo-bar'
            })
            class TestComponent {}`;
            assertSuccess('directive-class-suffix', source);
        });
    });
    describe('valid pipe class', () => {
        it('should succeed when is used @Pipe decorator', () => {
            let source = `
            @Pipe({
                selector: 'sg-test-pipe'
            })
            class TestPipe {}`;
            assertSuccess('directive-class-suffix', source);
        });
    });
    describe('valid service class', () => {
        it('should succeed when is used @Injectable decorator', () => {
            let source = `
            @Injectable()
            class TestService {}`;
            assertSuccess('directive-class-suffix', source);
        });
    });
    describe('valid empty class', () => {
        it('should succeed when the class is empty', () => {
            let source = `
            class TestEmpty {}`;
            assertSuccess('directive-class-suffix', source);
        });
    });
});
