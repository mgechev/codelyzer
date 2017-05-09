"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('use-view-encapsulation', function () {
    describe('invalid view encapsulation', function () {
        it('should fail if ViewEncapsulation.None is set', function () {
            var source = "\n        @Component({\n          selector: 'sg-foo-bar',\n          encapsulation: ViewEncapsulation.None\n                         ~~~~~~~~~~~~~~~~~~~~~~\n        })\n        export class TestComponent { }\n      ";
            testHelper_1.assertAnnotated({
                ruleName: 'use-view-encapsulation',
                message: 'Using "ViewEncapsulation.None" will make your styles global which may have unintended effect',
                source: source
            });
        });
    });
    describe('valid view encapsulation', function () {
        it('should succeed if ViewEncapsulation.Native is set', function () {
            var source = "\n        @Component({\n          selector: 'sg-foo-bar',\n          encapsulation: ViewEncapsulation.Native\n        })\n        export class TestComponent { }\n      ";
            testHelper_1.assertSuccess('use-view-encapsulation', source);
        });
        it('should succeed if ViewEncapsulation.Emulated is set', function () {
            var source = "\n        @Component({\n          selector: 'sg-foo-bar',\n          encapsulation: ViewEncapsulation.Emulated\n        })\n        export class TestComponent { }\n      ";
            testHelper_1.assertSuccess('use-view-encapsulation', source);
        });
        it('should succeed if no ViewEncapsulation is set explicitly', function () {
            var source = "\n        @Component({\n          selector: 'sg-foo-bar',\n        })\n        export class TestComponent { }\n      ";
            testHelper_1.assertSuccess('use-view-encapsulation', source);
        });
    });
});
