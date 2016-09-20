import {assertFailure, assertSuccess} from './testHelper';

describe('no-attribute-parameter-decorator', () => {
    describe('invalid class constructor', () => {
        it(`should fail, when it's used attribute decorator`, () => {
            let source = `
               class ButtonComponent {
                label: string;
                constructor(@Attribute('label') label) {
                  this.label = label;
                }
               }`;
            assertFailure('no-attribute-parameter-decorator', source, {
                message: 'In the constructor of class "ButtonComponent", the parameter "label" uses the @Attribute decorator, ' +
                'which is considered as a bad practice. Please, consider construction of type "@Input() label: string"',
                startPosition: {
                    line: 3,
                    character: 28
                },
                endPosition: {
                    line: 3,
                    character: 53
                }
            });
        });

        it('should fail, when property class declaration uses @Attribute decorator', () => {
            let source = `
            class TestCaseSample {
                  static SampleTestCase = class extends TestCase {
                    constructor(@Attribute('label') label) {}
                  };
            }`;
            assertFailure('no-attribute-parameter-decorator', source, {
                message: 'In the constructor of class "SampleTestCase", the parameter "label" uses the @Attribute decorator, ' +
                'which is considered as a bad practice. Please, consider construction of type "@Input() label: string"',
                startPosition: {
                    line: 3,
                    character: 32
                },
                endPosition: {
                    line: 3,
                    character: 57
                }
            });
        });
    });

    describe('valid class constructor', () => {
        it('should succeed, when is not used attribute decorator', () => {
            let source = `
              class ButtonComponent {
                constructor(){}
              }`;
            assertSuccess('no-attribute-parameter-decorator', source);
        });

        it('should succeed, when is not used attribute decorator in property class declaration', () => {
            let source = `
            class TestCaseSample {
                  static SampleTestCase = class extends TestCase {
                    constructor() {}
                  };
            }`;
            assertSuccess('no-attribute-parameter-decorator', source);
        });
    });
});
