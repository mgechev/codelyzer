"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
var config_1 = require("../src/angular/config");
describe('no-access-missing-member', function () {
    describe('invalid expressions', function () {
        it('should fail when interpolating missing property', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo }}</div>'\n                             ~~~\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The property "foo" that you\'re trying to access does not exist in the class declaration.',
                source: source
            });
        });
        it('should work with existing properties and pipes', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div class=\"1 + {{ showMenu ? '' : 'pure-hidden-sm' }})\"></div>`\n                                        ~~~~~~~~\n        })\n        class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The property "showMenu" that you\'re trying to access does not exist in the class declaration.',
                source: source
            });
        });
        it('should fail when using missing method', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ baz() }}</div>\n                             ~~~\n        })\n        class Test {\n          bar() {}\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
                source: source
            });
        });
        it('should fail when using missing method in an interpolation mixed with text', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div> test {{ baz() }}</div>\n                                   ~~~\n        })\n        class Test {\n          bar() {}\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
                source: source
            });
        });
        it('should fail when using missing method in an interpolation mixed with text and interpolation', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div> test {{ bar() }} {{ baz() }}</div>\n                                               ~~~\n        })\n        class Test {\n          bar() {}\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
                source: source
            });
        });
        it('should fail when using missing method in an interpolation mixed with text, interpolation & binary expression', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div> test {{ bar() }} {{ bar() + baz() }}</div>\n                                                       ~~~\n        })\n        class Test {\n          bar() {}\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The method "baz" that you\'re trying to access does not exist in the class declaration. Probably you mean: "bar".',
                source: source
            });
        });
        it('should fail in binary operation with missing property', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ baz2() + foo }}</div>\n                                      ~~~\n        })\n        class Test {\n          baz2() {}\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The property "foo" that you\'re trying to access does not exist in the class declaration.',
                source: source
            });
        });
        it('should fail in binary operation with missing method', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ baz() + getPrsonName(1, 2, 3) }}</div>\n                                     ~~~~~~~~~~~~\n        })\n        class Test {\n          baz() {}\n          getPersonName() {}\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The method "getPrsonName" that you\'re trying to access does not exist in ' +
                    'the class declaration. Probably you mean: "getPersonName".',
                source: source
            });
        });
        it('should fail with property binding and missing method', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div [className]=\"bar()\"></div>\n                                       ~~~\n        })\n        class Test {\n          baz() {}\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
                source: source
            });
        });
        it('should fail with style binding and missing method', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div [style.color]=\"bar()\"></div>\n                                         ~~~\n        })\n        class Test {\n          baz() {}\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
                source: source
            });
        });
        it('should fail on event handling with missing method', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div (click)=\"bar()\"></div>\n                                   ~~~\n        })\n        class Test {\n          baz() {}\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
                source: source
            });
        });
        it('should fail on event handling on the right position with a lot of whitespace', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div (click)=   \"   bar()\"></div>\n                                         ~~~\n        })\n        class Test {\n          baz() {}\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
                source: source
            });
        });
        it('should fail on event handling on the right position with spaces and newlines', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div [class.foo]=   \"\n            bar()\"></div>`\n            ~~~\n        })\n        class Test {\n          baz() {}\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The method "bar" that you\'re trying to access does not exist in the class declaration. Probably you mean: "baz".',
                source: source
            });
        });
        it('should not throw when template ref used outside component scope', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<form #todoForm=\"ngForm\"></form><button [disabled]=\"!todoForm.form.valid\"></button>'\n        })\n        class Test {\n          foo: number;\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should not throw when routerLinkActive template ref is used in component', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<a #test=\"routerLinkActive\" [routerLinkActive]=\"\">{{ test }}</a>'\n        })\n        class Test {}";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should not throw when ngModel template ref is used in component', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<input #test=\"ngModel\" [(ngModel)]=\"foo\">{{ test }}'\n        })\n        class Test {\n          foo: string;\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should not throw when [md-menu-item] template ref is used in component', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div md-menu-item #test=\"mdMenuItem\">{{ test }}</div>'\n        })\n        class Test {\n          foo: string;\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should not throw when md-menu template ref is used in component', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<md-menu #test=\"mdMenu\">{{ test }}</md-menu>'\n        })\n        class Test {\n          foo: string;\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should not throw when md-button-toggle-group template ref is used in component', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<md-button-toggle-group #test=\"mdButtonToggleGroup\">{{ test }}</md-button-toggle-group>'\n        })\n        class Test {}";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should not throw when md-menu-trigger-for template ref is used in component', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div mdMenuTriggerFor #test=\"mdMenuTrigger\">{{ test }}</div>'\n        })\n        class Test {}";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should not throw when mdTooltip template ref is used in component', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div mdTooltip #test=\"mdTooltip\">{{ test }}</div>'\n        })\n        class Test {}";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should not throw when mdSelect template ref is used in component', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<md-select #test=\"mdSelect\">{{ test }}</md-select>'\n        })\n        class Test {}";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should fail with missing ref', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<bar #todoForm=\"baz\"><button [disabled]=\"!todoForm.form.valid\"></button></bar>'\n                                                               ~~~~~~~~\n        })\n        class Test {\n          foo: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The property "todoForm" that you\'re trying to access does not exist in the class declaration.',
                source: source
            });
        });
        it('should succeed with elementref', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<bar #baz>{{ baz.value }}</bar>'\n        })\n        class Test {\n          foo: number;\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
    });
    describe('valid expressions', function () {
        it('should succeed with "ngForm" ref', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<form #todoForm=\"ngForm\"><button [disabled]=\"!todoForm.form.valid\"></button></form>'\n        })\n        class Test {\n          foo: number;\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should support custom template refs', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<bar #todoForm=\"baz\"><button [disabled]=\"!todoForm.form.valid\"></button></bar>'\n        })\n        class Test {\n          foo: number;\n        }";
            config_1.Config.predefinedDirectives.push({
                selector: 'bar',
                exportAs: 'baz'
            });
            testHelper_1.assertSuccess('no-access-missing-member', source);
            config_1.Config.predefinedDirectives.pop();
        });
        it('should succeed with inline property declaration', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '{{ foo }}'\n        })\n        class Test {\n          constructor(public foo: number) {}\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should succeed with declared property', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo }}</div>'\n        })\n        class Test {\n          foo: number;\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should succeed on declared method', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo() }}</div>\n        })\n        class Test {\n          foo() {}\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
    });
    describe('nested properties and pipes', function () {
        it('should work with existing single-level nested properties', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo.bar }}</div>\n        })\n        class Test {\n          foo = {};\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should work with existing single-level non-existing nested properties', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo.bar }}</div>\n                             ~~~\n        })\n        class Test {\n          foo1 = {};\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The property "foo" that you\'re trying to access does not exist in the class declaration. Probably you mean: "foo1".',
                source: source
            });
        });
        it('should work with existing properties and pipes', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo | baz }}</div>\n        })\n        class Test {\n          foo = {};\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should work with existing properties and pipes', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div>{{ foo.baz() }}</div>\n        })\n        class Test {\n          foo = {};\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should work with existing properties and pipes', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div class=\"{{ showMenu ? '' : 'pure-hidden-sm' }}\"></div>`\n        })\n        class Test {\n          showMenu = {};\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should work with inputs with string values', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `\n            <form>\n              <input type=\"submit\" [hidden]=\"hasOrdered\" class=\"btn-menu\" value=\"Order\">\n              <button [hidden]=\"!hasOrdered\" class=\"bnt-red\">Already ordered</button>\n            </form>\n            `\n        })\n        class Test {\n          public hasOrdered: boolean;\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should work with getters', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `{{ bar }}`\n        })\n        class Test {\n          get bar() {\n            return 42;\n          }\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should work with setters', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div (click)=\"bar = 42\"></div>`\n        })\n        class Test {\n          set bar() {\n          }\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should work with getters', function () {
            var source = "\n        @Component({\n          template: `\n          <ul>\n            <li *ngFor=\"let bar of foo\">{{ bar }}</li>\n          </ul>\n            `\n        })\n        class Test {\n          foo = [];\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should work with "as" syntax', function () {
            var source = "\n        @Component({\n          template: `\n            <ng-container *ngIf=\"employee$ | async as emp\">{{ emp }}</ng-container>\n            `\n        })\n        class Test {\n          employee$;\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should work with local template variables', function () {
            var source = "\n        @Component({\n          template: `\n          <ul>\n            <li (click)=\"$event.stopPropagation()\"></li>\n          </ul>\n            `\n        })\n        class Test {\n          handler() {}\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should work with array element access', function () {
            var source = "\n        @Component({\n          template: '{{ names[0].firstName }}'\n        })\n        class Test {\n          get names() {\n            return [{ firstName: 'foo' }];\n          }\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should fail with array element access', function () {
            var source = "\n        @Component({\n          template: '{{t.errorData.errorMessages[0].message}}'\n                       ~\n        })\n        class Test {\n          get names() {\n            return [{ firstName: 'foo' }];\n          }\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The property "t" that you\'re trying to access does not exist in the class declaration.',
                source: source
            });
        });
        it('should fail with array element access', function () {
            var source = "\n        @Component({\n          template: '{{t.errorData[0].errorMessages.message}}'\n                       ~\n        })\n        class Test {\n          get names() {\n            return [{ firstName: 'foo' }];\n          }\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The property "t" that you\'re trying to access does not exist in the class declaration.',
                source: source
            });
        });
        it('should succeed with array element access', function () {
            var source = "\n        @Component({\n          template: '{{t.errorData[0].errorMessages.message}}'\n        })\n        class Test {\n          get t() {\n            return [{ firstName: 'foo' }];\n          }\n        }";
            testHelper_1.assertSuccess('no-access-missing-member', source);
        });
        it('should succeed with array element access', function () {
            var source = "\n        @Component({\n          template: `<div *ngIf=\"context\"></div>\n                     ~~~~~~~\n          `\n        })\n        class Test {\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The property "context" that you\'re trying to access does not exist in the class declaration.',
                source: source
            });
        });
        it('should succeed with array element access', function () {
            var source = "\n        @Component({\n          template: `<div *ngSwitch=\"context\">\n                     ~~~~~~~\n              <span *ngSwitchCase=\"bar\"></span>\n            </div>`\n        })\n        class Test {\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-access-missing-member',
                message: 'The property "context" that you\'re trying to access does not exist in the class declaration.',
                source: source
            });
        });
    });
});
