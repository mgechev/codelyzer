"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('component-class-suffix', function () {
    describe('invalid component class suffix', function () {
        it('should fail when component class is with the wrong suffix', function () {
            var source = "\n              @Component({\n                selector: 'sg-foo-bar'\n              })\n              class Test {}\n                    ~~~~\n              ";
            testHelper_1.assertAnnotated({
                ruleName: 'component-class-suffix',
                message: 'The name of the class Test should end with the suffix Component ($$02-03$$)',
                source: source
            });
        });
    });
    describe('valid component class name', function () {
        it('should succeed when the component class name ends with Component', function () {
            var source = "\n            @Component({\n                selector: 'sg-foo-bar',\n                template: '<foo-bar [foo]=\"bar\">{{baz + 42}}</foo-bar>'\n            })\n            class TestComponent {}";
            testHelper_1.assertSuccess('component-class-suffix', source);
        });
    });
    describe('valid directive class', function () {
        it('should succeed when is used @Directive decorator', function () {
            var source = "\n            @Directive({\n                selector: '[myHighlight]'\n            })\n            class TestDirective {}";
            testHelper_1.assertSuccess('component-class-suffix', source);
        });
    });
    describe('valid pipe class', function () {
        it('should succeed when is used @Pipe decorator', function () {
            var source = "\n            @Pipe({\n                selector: 'sg-test-pipe'\n            })\n            class TestPipe {}";
            testHelper_1.assertSuccess('component-class-suffix', source);
        });
    });
    describe('valid service class', function () {
        it('should succeed when is used @Injectable decorator', function () {
            var source = "\n            @Injectable()\n            class TestService {}";
            testHelper_1.assertSuccess('component-class-suffix', source);
        });
    });
    describe('valid empty class', function () {
        it('should succeed when the class is empty', function () {
            var source = "\n            class TestEmpty {}";
            testHelper_1.assertSuccess('component-class-suffix', source);
        });
    });
    describe('changed suffix', function () {
        it('should succeed when different suffix is set', function () {
            var source = "\n            @Component({\n                selector: 'sgBarFoo'\n            })\n            class TestPage {}";
            testHelper_1.assertSuccess('component-class-suffix', source, ['Page']);
        });
        it('should succeed when different list of suffix is set', function () {
            var source = "\n            @Component({\n                selector: 'sgBarFoo'\n            })\n            class TestPage {}";
            testHelper_1.assertSuccess('component-class-suffix', source, ['Page', 'View']);
        });
        it('should fail when different list of suffix is set and doesnt match', function () {
            var source = "\n            @Component({\n                selector: 'sgBarFoo'\n            })\n            class TestPage {}\n                  ~~~~~~~~\n            ";
            testHelper_1.assertAnnotated({
                ruleName: 'component-class-suffix',
                message: 'The name of the class TestPage should end with the suffix Component,View ($$02-03$$)',
                source: source,
                options: ['Component', 'View']
            });
        });
        it('should fail when different sufix is set and doesnt match', function () {
            var source = "\n            @Component({\n                selector: 'sgBarFoo'\n            })\n            class TestPage {}\n                  ~~~~~~~~\n            ";
            testHelper_1.assertAnnotated({
                ruleName: 'component-class-suffix',
                message: 'The name of the class TestPage should end with the suffix Component ($$02-03$$)',
                source: source,
                options: ['Component']
            });
        });
        it('should fail when different sufix is set and doesnt match', function () {
            var source = "\n            @Component({\n                selector: 'sgBarFoo'\n            })\n            class TestDirective {}\n                  ~~~~~~~~~~~~~\n            ";
            testHelper_1.assertAnnotated({
                ruleName: 'component-class-suffix',
                message: 'The name of the class TestDirective should end with the suffix Page ($$02-03$$)',
                source: source,
                options: ['Page']
            });
        });
    });
});
