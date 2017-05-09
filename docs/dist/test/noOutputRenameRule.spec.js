"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('no-output-rename', function () {
    describe('invalid directive output property', function () {
        it("should fail, when a directive output property is renamed", function () {
            var source = "\n      class ButtonComponent {\n        @Output('changeEvent') change = new EventEmitter<any>();\n        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n      }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-output-rename',
                message: 'In the class "ButtonComponent", the directive output property "change" should not be renamed.' +
                    'Please, consider the following use "@Output() change = new EventEmitter();"',
                source: source
            });
        });
    });
    describe('valid directive output property', function () {
        it('should succeed, when a directive output property is properly used', function () {
            var source = "\n      class ButtonComponent {\n         @Output() change = new EventEmitter<any>();\n      }";
            testHelper_1.assertSuccess('no-output-rename', source);
        });
        it('should succeed, when a directive output property rename is the same as the property name', function () {
            var source = "\n      class ButtonComponent {\n         @Output('change') change = new EventEmitter<any>();\n      }";
            testHelper_1.assertSuccess('no-output-rename', source);
        });
    });
});
