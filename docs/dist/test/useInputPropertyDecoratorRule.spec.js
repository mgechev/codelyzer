"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('use-input-property-decorator', function () {
    it('should fail when "inputs" is used in @Component', function () {
        var source = "\n      @Component({\n        inputs: [\n        ~~~~~~~~~\n          'id: foo'\n        ]\n        ~\n      })\n      class Bar {}\n    ";
        testHelper_1.assertAnnotated({
            ruleName: 'use-input-property-decorator',
            message: 'Use the @Input property decorator instead of the inputs property ($$05-12$$)',
            source: source
        });
    });
    it('should succeed when "inputs" is not used', function () {
        var source = "\n      @Component({\n        selector: 'baz'\n      })\n      class Bar {}\n    ";
        testHelper_1.assertSuccess('use-input-property-decorator', source);
    });
    it('should fail when "inputs" is used in @Directive', function () {
        var source = "\n      @Directive({\n        inputs: [\n        ~~~~~~~~~\n          'id: foo'\n        ]\n        ~\n      })\n      class Baz {}\n    ";
        testHelper_1.assertAnnotated({
            ruleName: 'use-input-property-decorator',
            message: 'Use the @Input property decorator instead of the inputs property ($$05-12$$)',
            source: source
        });
    });
});
