"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('pipe-naming', function () {
    describe('invalid pipe name', function () {
        it('should fail when Pipe is named camelCase without prefix ng', function () {
            var source = "\n                      @Pipe({\n                        name: 'foo-bar'\n                        ~~~~~~~~~~~~~~~\n                      })\n                      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'pipe-naming',
                message: 'The name of the Pipe decorator of class Test should be named ' +
                    'camelCase with prefix ng, however its value is "foo-bar".',
                source: source,
                options: ['camelCase', 'ng']
            });
        });
        it('should fail when Pipe is named camelCase without prefix applying multiple prefixes', function () {
            var source = "\n                      @Pipe({\n                        name: 'foo-bar'\n                        ~~~~~~~~~~~~~~~\n                      })\n                      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'pipe-naming',
                message: 'The name of the Pipe decorator of class Test should be named camelCase' +
                    ' with prefix ng,mg,sg, however its value is "foo-bar".',
                source: source,
                options: ['camelCase', 'ng', 'mg', 'sg']
            });
        });
        it('should fail when Pipe is named camelCase and has longer prefix', function () {
            var source = "\n                      @Pipe({\n                        name: 'fooBar'\n                        ~~~~~~~~~~~~~~\n                      })\n                      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'pipe-naming',
                message: 'The name of the Pipe decorator of class Test should be named camelCase ' +
                    'with prefix fo,mg,sg, however its value is "fooBar".',
                source: source,
                options: ['camelCase', 'fo', 'mg', 'sg']
            });
        });
        it('should fail when Pipe is not named camelCase without prefix', function () {
            var source = "\n                      @Pipe({\n                        name: 'foo-bar'\n                        ~~~~~~~~~~~~~~~\n                      })\n                      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'pipe-naming',
                message: 'The name of the Pipe decorator of class Test should be named camelCase,' +
                    ' however its value is "foo-bar".',
                source: source,
                options: 'camelCase'
            });
        });
    });
    describe('empty pipe', function () {
        it('should not fail when @Pipe not invoked', function () {
            var source = "\n                    @Pipe\n                    class Test {}";
            testHelper_1.assertSuccess('pipe-naming', source, ['camelCase', 'ng']);
        });
    });
    describe('valid pipe name', function () {
        it('should succeed when set valid name with prefix ng in @Pipe', function () {
            var source = "\n                    @Pipe({\n                      name: 'ngBarFoo'\n                    })\n                    class Test {}";
            testHelper_1.assertSuccess('pipe-naming', source, ['camelCase', 'ng']);
        });
        it('should succeed when set valid name applying multiple prefixes in @Pipe', function () {
            var source = "\n                    @Pipe({\n                      name: 'ngBarFoo'\n                    })\n                    class Test {}";
            testHelper_1.assertSuccess('pipe-naming', source, ['camelCase', 'ng', 'sg', 'mg']);
        });
        it('should succeed when set valid name in @Pipe', function () {
            var source = "\n                    @Pipe({\n                      name: 'barFoo'\n                    })\n                    class Test {}";
            testHelper_1.assertSuccess('pipe-naming', source, ['camelCase']);
        });
        it('should succeed when the class is not a Pipe', function () {
            var source = "\n                    class Test {}";
            testHelper_1.assertSuccess('pipe-naming', source, ['camelCase']);
        });
        it('should do nothing if the name of the pipe is not a literal', function () {
            var source = "\n                      const pipeName = 'foo-bar';\n                      @Pipe({\n                        name: pipeName\n                      })\n                      class Test {}";
            testHelper_1.assertSuccess('pipe-naming', source, ['camelCase']);
        });
    });
});
