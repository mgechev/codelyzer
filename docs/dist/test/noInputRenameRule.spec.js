"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('no-input-rename', function () {
    describe('invalid directive input property', function () {
        it("should fail, when a directive input property is renamed", function () {
            var source = "\n      class ButtonComponent {\n        @Input('labelAttribute') label: string;\n        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n      }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-input-rename',
                message: 'In the class "ButtonComponent", the directive input property "label" should not be renamed.' +
                    'Please, consider the following use "@Input() label: string"',
                source: source
            });
        });
    });
    describe('valid directive input property', function () {
        it('should succeed, when a directive input property is properly used', function () {
            var source = "\n      class ButtonComponent {\n        @Input() label: string;\n      }";
            testHelper_1.assertSuccess('no-input-rename', source);
        });
        it('should succeed, when a directive input property rename is the same as the name of the property', function () {
            var source = "\n      class ButtonComponent {\n        @Input('label') label: string;\n      }";
            testHelper_1.assertSuccess('no-input-rename', source);
        });
    });
});
