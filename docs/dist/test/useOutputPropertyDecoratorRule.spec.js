"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('use-output-property-decorator', function () {
    it('should fail when "outputs" is used in @Component', function () {
        var source = "\n      @Component({\n        outputs: [\n        ~~~~~~~~~~\n          'id: foo'\n        ]\n        ~\n      })\n      class Bar {}\n    ";
        testHelper_1.assertAnnotated({
            ruleName: 'use-output-property-decorator',
            message: 'Use the @Output property decorator instead of the outputs property ($$05-12$$)',
            source: source
        });
    });
    it('should succeed when "outputs" is not used', function () {
        var source = "\n      @Component({\n        selector: 'baz'\n      })\n      class Bar {}\n    ";
        testHelper_1.assertSuccess('use-output-property-decorator', source);
    });
    it('should fail when "outputs" is used in @Directive', function () {
        var source = "\n      @Directive({\n        outputs: [\n        ~~~~~~~~~~\n          'id: foo'\n        ]\n        ~\n      })\n      class Baz {}\n    ";
        testHelper_1.assertAnnotated({
            ruleName: 'use-output-property-decorator',
            message: 'Use the @Output property decorator instead of the outputs property ($$05-12$$)',
            source: source
        });
    });
});
