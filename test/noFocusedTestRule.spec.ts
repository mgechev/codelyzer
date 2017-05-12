import {assertFailure, assertSuccess} from './testHelper';

describe('no-focused-test', () => {
    describe('invalid function call', () => {
        it('should fail when we focus on an individual test', () => {
            let source = `fit('this is a test', function() {
                expect(1).toBe(2);
            });`;
            assertFailure('no-focused-test', source, {
                message: 'Focused tests are not allowed',
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

        it('should fail when we focus on an individual describe', () => {
            let source = `fdescribe('here are some tests', function() {
                it('this is a test', function() {
                    expect(1).toBe(2);
                });
            });`;
            assertFailure('no-focused-test', source, {
                message: 'Focused tests are not allowed',
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
        it('should succeed, when we are not using a focused test', () => {
            let source = `
              it('this is a test', function() {
                  expect(1).toBe(2);
              })`;
            assertSuccess('no-focused-test', source);
        });
    });
});
