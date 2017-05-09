"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('use-pipe-decorator', function () {
    describe('invalid use of pipe transform interface', function () {
        it("should fail, when PipeTransform interface is used, without @Pipe or any decorators", function () {
            var source = "\n      export class NewPipe implements PipeTransform {\n      ~~~~~~~~~~~~~~~~~~~~\n        transform(url:string):any {\n        }\n      }\n      ~";
            testHelper_1.assertAnnotated({
                ruleName: 'use-pipe-decorator',
                message: 'The NewPipe class implements the PipeTransform interface, so it should use the @Pipe decorator',
                source: source
            });
        });
        it("should fail, when PipeTransform interface is used, without @Pipe decorator, but using other", function () {
            var source = "\n        @Test()\n        ~~~~~~~\n        export class Test implements PipeTransform {\n        }\n        ~";
            testHelper_1.assertAnnotated({
                ruleName: 'use-pipe-decorator',
                message: 'The Test class implements the PipeTransform interface, so it should use the @Pipe decorator',
                source: source
            });
        });
        it("should fail, when PipeTransform interface is used, without @Pipe decorator, but using multiple others", function () {
            var source = "\n        @Test()\n        ~~~~~~~\n        @Test2()\n        export class Test  implements PipeTransform {\n        }\n        ~";
            testHelper_1.assertAnnotated({
                ruleName: 'use-pipe-decorator',
                message: 'The Test class implements the PipeTransform interface, so it should use the @Pipe decorator',
                source: source
            });
        });
    });
    describe('valid use of pipe transform interface', function () {
        it("should succeed, when PipeTransform interface is used, with Pipe decorator", function () {
            var source = "\n      @Pipe({name: 'fetch'})\n      export class NewPipe  implements PipeTransform{\n          transform(url:string):any {\n          }\n        }";
            testHelper_1.assertSuccess('use-pipe-decorator', source);
        });
    });
    describe('valid use of empty class', function () {
        it("should succeed, when PipeTransform interface is not used", function () {
            var source = "class App{}";
            testHelper_1.assertSuccess('use-pipe-decorator', source);
        });
    });
});
