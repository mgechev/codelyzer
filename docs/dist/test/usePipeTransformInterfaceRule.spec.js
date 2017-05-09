"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('use-pipe-transform-interface', function () {
    describe('invalid declaration of pipe', function () {
        it("should fail, when a Pipe is declared without implementing the PipeTransform interface", function () {
            var source = "\n      @Pipe({name: 'fetch'})\n      ~~~~~~~~~~~~~~~~~~~~~~\n      export class NewPipe {\n        transform(url:string):any {\n        }\n      }\n      ~";
            testHelper_1.assertAnnotated({
                ruleName: 'use-pipe-transform-interface',
                message: 'The NewPipe class has the Pipe decorator, so it should implement the PipeTransform interface',
                source: source
            });
        });
    });
    describe('valid use of Pipe with the implementation of the PipeTransform interface', function () {
        it("should succeed when Pipe is declared properly", function () {
            var source = "\n        @Pipe({name: 'fetch'})\n        export class NewPipe  implements PipeTransform{\n          transform(url:string):any {\n          }\n        }";
            testHelper_1.assertSuccess('use-pipe-transform-interface', source);
        });
        it("should succeed when Pipe is declared properly", function () {
            var source = "\n        @Pipe({name: 'fetch'})\n        export class NewPipe  implements ng.PipeTransform {\n          transform(url:string):any {\n          }\n        }";
            testHelper_1.assertSuccess('use-pipe-transform-interface', source);
        });
    });
    describe('valid use of empty class', function () {
        it("should succeed, when Pipe is not used", function () {
            var source = "class App{}";
            testHelper_1.assertSuccess('use-pipe-transform-interface', source);
        });
    });
    describe('valid use with @Injectable', function () {
        it("should succeed, when Pipe is not used", function () {
            var source = "@Injectable\n        class App{}";
            testHelper_1.assertSuccess('use-pipe-transform-interface', source);
        });
    });
});
