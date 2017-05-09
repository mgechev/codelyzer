"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('no-attribute-parameter-decorator', function () {
    describe('invalid class constructor', function () {
        it("should fail, when it's used attribute decorator", function () {
            var source = "\n               class ButtonComponent {\n                label: string;\n                constructor(@Attribute('label') label) {\n                            ~~~~~~~~~~~~~~~~~~~~~~~~~\n                  this.label = label;\n                }\n               }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-attribute-parameter-decorator',
                message: 'In the constructor of class "ButtonComponent", the parameter "label" uses the @Attribute decorator, ' +
                    'which is considered as a bad practice. Please, consider construction of type "@Input() label: string"',
                source: source
            });
        });
        it('should fail, when property class declaration uses @Attribute decorator', function () {
            var source = "\n            class TestCaseSample {\n                  static SampleTestCase = class extends TestCase {\n                    constructor(@Attribute('label') label) {}\n                                ~~~~~~~~~~~~~~~~~~~~~~~~~\n                  };\n            }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-attribute-parameter-decorator',
                message: 'In the constructor of class "SampleTestCase", the parameter "label" uses the @Attribute decorator, ' +
                    'which is considered as a bad practice. Please, consider construction of type "@Input() label: string"',
                source: source
            });
        });
    });
    describe('valid class constructor', function () {
        it('should succeed, when is not used attribute decorator', function () {
            var source = "\n              class ButtonComponent {\n                constructor(){}\n              }";
            testHelper_1.assertSuccess('no-attribute-parameter-decorator', source);
        });
        it('should succeed, when is not used attribute decorator in property class declaration', function () {
            var source = "\n            class TestCaseSample {\n                  static SampleTestCase = class extends TestCase {\n                    constructor() {}\n                  };\n            }";
            testHelper_1.assertSuccess('no-attribute-parameter-decorator', source);
        });
    });
});
