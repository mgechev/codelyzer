import {assertFailure, assertSuccess} from './testHelper';

describe('pipe-naming', () => {
    describe('invalid pipe name', () => {
        it('should fail when Pipe is named camelCase with prefix ng', () => {
            let source = `
                      @Pipe({
                        name: 'foo-bar'
                      })
                      class Test {}`;
            assertFailure('pipe-naming', source, {
                message: 'The name of the Pipe decorator of class Test should be named camelCase with prefix ng, however its value is "foo-bar".',
                startPosition: {
                    line: 2,
                    character: 24
                },
                endPosition: {
                    line: 2,
                    character: 39
                }
            }, ['camelCase','ng']);
        });
    });
    describe('invalid pipe name', () => {
        it('should fail when Pipe is named camelCase without prefix', () => {
            let source = `
                      @Pipe({
                        name: 'foo-bar'
                      })
                      class Test {}`;
            assertFailure('pipe-naming', source, {
                message: 'The name of the Pipe decorator of class Test should be named camelCase, however its value is "foo-bar".',
                startPosition: {
                    line: 2,
                    character: 24
                },
                endPosition: {
                    line: 2,
                    character: 39
                }
            }, 'camelCase');
        });
    });
    describe('valid pipe name', () => {
        it('should succeed when set valid name with prefix ng in @Pipe', () => {
            let source = `
                    @Pipe({
                      name: 'ngBarFoo'
                    })
                    class Test {}`;
            assertSuccess('pipe-naming', source, ['camelCase','ng']);
        });
    });
    describe('valid pipe name', () => {
        it('should succeed when set valid name in @Pipe', () => {
            let source = `
                    @Pipe({
                      name: 'barFoo'
                    })
                    class Test {}`;
            assertSuccess('pipe-naming', source, ['camelCase']);
        });
    });
    describe('valid empty class', () => {
        it('should succeed when the class is not a Pipe', () => {
            let source = `
                    class Test {}`;
            assertSuccess('pipe-naming', source, ['camelCase']);
        });
    });
});
