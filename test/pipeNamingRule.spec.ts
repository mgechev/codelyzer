import {assertFailure, assertSuccess} from './testHelper';

describe('pipe-naming', () => {
    describe('invalid pipe name', () => {
        it('should fail when Pipe is named camelCase with prefix ng', () => {
            let source = `
                      @Pipe({
                        name: 'fooBar'
                      })
                      class Test {}`;
            assertFailure('pipe-naming', source, {
                message: 'The name of the Pipe decorator of class Test should be named kebab-case with prefix ng, however its value is "fooBar".',
                startPosition: {
                    line: 2,
                    character: 24
                },
                endPosition: {
                    line: 2,
                    character: 38
                }
            }, ['kebab-case','ng']);
        });
    });
    describe('invalid pipe name', () => {
        it('should fail when Pipe is named camelCase without prefix', () => {
            let source = `
                      @Pipe({
                        name: 'fooBar'
                      })
                      class Test {}`;
            assertFailure('pipe-naming', source, {
                message: 'The name of the Pipe decorator of class Test should be named kebab-case, however its value is "fooBar".',
                startPosition: {
                    line: 2,
                    character: 24
                },
                endPosition: {
                    line: 2,
                    character: 38
                }
            }, 'kebab-case');
        });
    });
    describe('valid pipe name', () => {
        it('should succeed when set valid name with prefix ng in @Pipe', () => {
            let source = `
                    @Pipe({
                    name: 'ng-bar-foo'
                    })
                    class Test {}`;
            assertSuccess('pipe-naming', source, ['kebab-case','ng']);
        });
    });
    describe('valid pipe name', () => {
        it('should succeed when set valid name in @Pipe', () => {
            let source = `
                    @Pipe({
                    name: 'bar-foo'
                    })
                    class Test {}`;
            assertSuccess('pipe-naming', source, ['kebab-case']);
        });
    });
    describe('valid empty class', () => {
        it('should succeed when the class is not a Pipe', () => {
            let source = `
                    class Test {}`;
            assertSuccess('pipe-naming', source, ['kebab-case']);
        });
    });
});
