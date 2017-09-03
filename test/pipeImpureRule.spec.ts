import { assertSuccess, assertAnnotated } from './testHelper';

describe('pipe-impure', () => {
    describe('impure pipe', () => {
        it('should fail when Pipe is impure', () => {
            let source = `
                      @Pipe({
                        pure: false
                        ~~~~~~~~~~~
                      })
                      class Test {}`;
            assertAnnotated({
                ruleName: 'pipe-impure',
                message: 'Warning: impure pipe declared in class Test.',
                source
            });
        });
    });

    describe('pure pipe', () => {
        it('should succeed when Pipe is pure', () => {
            let source = `
                    @Pipe({
                      pure: true
                    })
                    class Test {}`;
            assertSuccess('pipe-impure', source);
        });
    });

    describe('empty pipe', () => {
        it('should not fail', () => {
            let source = `
                    @Pipe
                    class Test {}`;
            assertSuccess('pipe-impure', source);
        });
    });

    describe('default pipe', () => {
        it('should succeed when Pipe pure property is not set', () => {
            let source = `
                    @Pipe({
                      name: 'testPipe'
                    })
                    class Test {}`;
            assertSuccess('pipe-impure', source);
        });
    });
});
