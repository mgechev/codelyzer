"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('use-host-property-decorator', function () {
    it('should fail when "host" is used in @Component', function () {
        var source = "\n      @Component({\n        host: {\n        ~~~~~~~\n          '(click)': 'bar()'\n        }\n        ~\n      })\n      class Bar {}\n    ";
        testHelper_1.assertAnnotated({
            ruleName: 'use-host-property-decorator',
            message: 'Use @HostBindings and @HostListeners instead of the host property ($$06-03$$)',
            source: source
        });
    });
    it('should succeed when "host" is not used', function () {
        var source = "\n      @Component({\n        selector: 'baz'\n      })\n      class Bar {}\n    ";
        testHelper_1.assertSuccess('use-host-property-decorator', source);
    });
    it('should fail when "host" is used in @Directive', function () {
        var source = "\n      @Directive({\n        host: {\n        ~~~~~~~\n          '(click)': 'bar()'\n        }\n        ~\n      })\n      class Baz {}\n    ";
        testHelper_1.assertAnnotated({
            ruleName: 'use-host-property-decorator',
            message: 'Use @HostBindings and @HostListeners instead of the host property ($$06-03$$)',
            source: source
        });
    });
});
