"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('pipe-impure', function () {
    describe('impure pipe', function () {
        it('should fail when Pipe is impure', function () {
            var source = "\n                      @Pipe({\n                        pure: false\n                        ~~~~~~~~~~~\n                      })\n                      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'pipe-impure',
                message: 'Warning: impure pipe declared in class Test.',
                source: source
            });
        });
    });
    describe('pure pipe', function () {
        it('should succeed when Pipe is pure', function () {
            var source = "\n                    @Pipe({\n                      pure: true\n                    })\n                    class Test {}";
            testHelper_1.assertSuccess('pipe-impure', source);
        });
    });
    describe('empty pipe', function () {
        it('should not fail', function () {
            var source = "\n                    @Pipe\n                    class Test {}";
            testHelper_1.assertSuccess('pipe-impure', source);
        });
    });
    describe('default pipe', function () {
        it('should succeed when Pipe pure property is not set', function () {
            var source = "\n                    @Pipe({\n                      name: 'testPipe'\n                    })\n                    class Test {}";
            testHelper_1.assertSuccess('pipe-impure', source);
        });
    });
});
