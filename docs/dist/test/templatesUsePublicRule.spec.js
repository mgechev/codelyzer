"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('templates-use-public', function () {
    describe('invalid expressions', function () {
        it('should fail inline property private declaration', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '{{ foo }}'\n                        ~~~\n        })\n        class Test {\n          constructor(private foo: number) {}\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'templates-use-public',
                message: 'You can bind only to public class members. "foo" is not a public class member.',
                source: source
            });
        });
        it('should fail when interpolating private property', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo }}</div>\n                             ~~~\n        })\n        class Test {\n          private foo: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'templates-use-public',
                message: 'You can bind only to public class members. "foo" is not a public class member.',
                source: source
            });
        });
        it('should fail when interpolating protected property', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo }}</div>\n                             ~~~\n        })\n        class Test {\n          protected foo: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'templates-use-public',
                message: 'You can bind only to public class members. "foo" is not a public class member.',
                source: source
            });
        });
        it('should fail when interpolating protected nested property', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo.bar }}</div>\n                             ~~~\n        })\n        class Test {\n          protected foo: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'templates-use-public',
                message: 'You can bind only to public class members. "foo" is not a public class member.',
                source: source
            });
        });
        it('should fail when interpolating protected nested property', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div (click)=\"foo.bar = 2\"></div>'\n                                   ~~~\n        })\n        class Test {\n          protected foo: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'templates-use-public',
                message: 'You can bind only to public class members. "foo" is not a public class member.',
                source: source
            });
        });
        it('should fail when binding to protected method', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div [bar]=\"foo()\"></div>\n                                 ~~~\n        })\n        class Test {\n          protected foo() {};\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'templates-use-public',
                message: 'You can bind only to public class members. "foo" is not a public class member.',
                source: source
            });
        });
    });
    describe('valid expressions', function () {
        it('should succeed inline property public declaration', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '{{ foo }}'\n        })\n        class Test {\n          constructor(public foo: number) {}\n        }";
            testHelper_1.assertSuccess('templates-use-public', source);
        });
        it('should succeed with public property', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo }}</div>\n        })\n        class Test {\n          foo: number;\n        }";
            testHelper_1.assertSuccess('templates-use-public', source);
        });
        it('should succeed with non-existing property', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo }}</div>\n        })\n        class Test {\n        }";
            testHelper_1.assertSuccess('templates-use-public', source);
        });
        it('should succeed on public method', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo() }}</div>\n        })\n        class Test {\n          public foo() {}\n        }";
            testHelper_1.assertSuccess('templates-use-public', source);
        });
        it('should succeed on public nested props', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo.baz.bar }}</div>\n        })\n        class Test {\n          foo = {};\n        }";
            testHelper_1.assertSuccess('templates-use-public', source);
        });
        it('should succeed on public nested props', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo[1].baz.bar }}</div>\n        })\n        class Test {\n          foo: any;\n        }";
            testHelper_1.assertSuccess('templates-use-public', source);
        });
        it('should succeed on public nested props', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo }}</div>\n        })\n        class Test {\n          readonly foo: any;\n        }";
            testHelper_1.assertSuccess('templates-use-public', source);
        });
        it('should succeed shadowed variable', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `\n            <div *ngFor=\"let smile of smile\">\n              <smile-cmp [smile]=\"smile\"></smile-cmp>\n            </div>\n          `\n        })\n        class Test {\n          smile: any;\n        }";
            testHelper_1.assertSuccess('templates-use-public', source);
        });
        it('should fail when private property used in *ngFor', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `\n            <div *ngFor=\"let smile of smile2\">\n            ~~~~~~\n              <smile-cmp [smile]=\"smile\"></smile-cmp>\n            </div>\n          `\n        })\n        class Test {\n          private smile2: any;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'templates-use-public',
                message: 'You can bind only to public class members. "smile2" is not a public class member.',
                source: source
            });
        });
        it('should fail when private property used in *ngFor', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `\n            <div *ngFor=\"let smile of smile\">\n            ~~~~~\n              <smile-cmp [smile]=\"smile\"></smile-cmp>\n            </div>\n          `\n        })\n        class Test {\n          private smile: any;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'templates-use-public',
                message: 'You can bind only to public class members. "smile" is not a public class member.',
                source: source
            });
        });
    });
});
