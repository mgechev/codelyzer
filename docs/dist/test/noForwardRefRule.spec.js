"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('no-forward-ref', function () {
    describe('invalid function call', function () {
        it('should fail when we are calling forwardRef in constructor', function () {
            var source = "\n      class Test {\n        constructor(@Inject(forwardRef(()=>NameService)) nameService) {}\n                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~\n      }\n      class NameService {}";
            testHelper_1.assertAnnotated({
                ruleName: 'no-forward-ref',
                message: 'Avoid using forwardRef in class "Test"',
                source: source
            });
        });
        it('should fail when we are calling forwardRef in Component directives array', function () {
            var source = "\n      @Component({\n        directives: [forwardRef(()=>NameService)]\n                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~\n      })\n      class Test {}\n      class NameService {}";
            testHelper_1.assertAnnotated({
                ruleName: 'no-forward-ref',
                message: 'Avoid using forwardRef in class "Test"',
                source: source
            });
        });
        it('should fail when we are calling forwardRef in variable', function () {
            var source = "\n      const TAGS_INPUT_CONTROL_VALUE_ACCESSOR = new Provider(\n          NG_VALUE_ACCESSOR, {\n            useExisting: forwardRef(() => TagsInput),\n                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~\n            multi: true\n      });";
            testHelper_1.assertAnnotated({
                ruleName: 'no-forward-ref',
                message: 'Avoid using forwardRef in variable "TAGS_INPUT_CONTROL_VALUE_ACCESSOR"',
                source: source
            });
        });
    });
    it('should work with NG_VALUE_ACCESSORs', function () {
        var source = "const CUSTOM_VALUE_ACCESSOR = new Provider(\n    NG_VALUE_ACCESSOR, { useExisting: forwardRef(() => CountryListValueAccessor)});\n                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n    ";
        testHelper_1.assertAnnotated({
            ruleName: 'no-forward-ref',
            message: 'Avoid using forwardRef in variable "CUSTOM_VALUE_ACCESSOR"',
            source: source
        });
    });
    describe('valid function call', function () {
        it('should succeed, when we are not calling forwardRef', function () {
            var source = "\n      class Test {\n        constructor() {\n          this.test();\n        }\n        test(){\n        }\n      }";
            testHelper_1.assertSuccess('no-forward-ref', source);
        });
    });
});
