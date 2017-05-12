import {assertFailure, assertSuccess} from './testHelper';

describe('no-skipped-test', () => {
    describe('invalid function call', () => {
        it('should fail when we skip an individual test', () => {
            let source = `xit('this is a test', function() {
                expect(1).toBe(2);
            });`;
            assertFailure('no-skipped-test', source, {
                message: 'Skipped tests are not allowed',
                startPosition: {
                    line: 0,
                    character: 0
                },
                endPosition: {
                    line: 0,
                    character: 1
                }
            });
        });

        it('should fail when we skip an individual describe', () => {
            let source = `xdescribe('here are some tests', function() {
                it('this is a test', function() {
                    expect(1).toBe(2);
                });
            });`;
            assertFailure('no-skipped-test', source, {
                message: 'Skipped tests are not allowed',
                startPosition: {
                    line: 0,
                    character: 0
                },
                endPosition: {
                    line: 0,
                    character: 1
                }
            });
        });
    });
    describe('valid function call', () => {
        it('should succeed, when we are not using a skipped test', () => {
            let source = `
              it('this is a test', function() {
                  expect(1).toBe(2);
              })`;
            assertSuccess('no-focused-test', source);
        });
    });
});
