"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('invoke-injectable', function () {
    describe('success', function () {
        it('should not fail when no decorator is set', function () {
            var source = 'class Foobar {}';
            testHelper_1.assertSuccess('invoke-injectable', source);
        });
        it('should not fail when different decorator is used', function () {
            var source = "\n        @Component()\n        @Wove\n        class Foobar {\n          foo() {}\n        }\n      ";
            testHelper_1.assertSuccess('invoke-injectable', source);
        });
        it('should not fail when injectable is invoked', function () {
            var source = "\n        @Injectable()\n        class Foobar {\n          foo() {}\n        }\n      ";
            testHelper_1.assertSuccess('invoke-injectable', source);
        });
    });
    describe('failure', function () {
        it('should fail when injectable is not invoked', function () {
            var source = "\n        @Injectable\n        ~~~~~~~~~~~\n        class Foobar {\n          foo() {}\n        }\n      ";
            testHelper_1.assertAnnotated({
                ruleName: 'invoke-injectable',
                message: 'You have to invoke @Injectable()',
                source: source
            });
        });
        it('should fail when injectable is not invoked and multiple decorators are used', function () {
            var source = "\n        @Injectable\n        ~~~~~~~~~~~\n        @Component()\n        class Foobar {\n          foo() {}\n        }\n      ";
            testHelper_1.assertAnnotated({
                ruleName: 'invoke-injectable',
                message: 'You have to invoke @Injectable()',
                source: source
            });
        });
    });
});
