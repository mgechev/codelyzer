"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('directive-selector-name', function () {
    describe('invalid directive selectors', function () {
        it('should fail when directive named kebab-case', function () {
            var source = "\n      @Directive({\n        selector: '[sg-foo-bar]'\n                  ~~~~~~~~~~~~~~\n      })\n      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'directive-selector',
                message: 'The selector of the directive "Test" should be named camelCase ($$02-06$$)',
                source: source,
                options: ['attribute', 'sg', 'camelCase']
            });
        });
    });
    describe('valid directive selector, using multiple selectors', function () {
        it('should succeed when set valid selector in @Directive', function () {
            var source = "\n      @Directive({\n        selector: 'test[sgBarFoo].test:not(p)'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('directive-selector', source, ['attribute', 'sg', 'camelCase']);
        });
    });
    describe('valid directive selector, using multiple selectors, element type and kebap-case', function () {
        it('should succeed when set valid selector in @Directive', function () {
            var source = "\n      @Directive({\n        selector: 'sg-bar-foo[test].test:not(p)'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('directive-selector', source, ['element', 'sg', 'kebab-case']);
        });
    });
    describe('invalid directive selector, using multiple selectors', function () {
        it('should succeed when set valid selector in @Directive and multiple selectors', function () {
            var source = "\n      @Directive({\n        selector: 'test[sg-bar-foo].test:not(p)'\n                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n      })\n      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'directive-selector',
                message: 'The selector of the directive "Test" should be named camelCase ($$02-06$$)',
                source: source,
                options: ['attribute', 'sg', 'camelCase']
            });
        });
    });
});
describe('directive-selector-prefix', function () {
    describe('invalid directive selectors', function () {
        it('should fail when directive used without prefix', function () {
            var source = "\n          @Directive({\n            selector: '[fooBar]'\n                      ~~~~~~~~~~\n          })\n          class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'directive-selector',
                message: 'The selector of the directive "Test" should have prefix "sg" ($$02-08$$)',
                source: source,
                options: ['attribute', 'sg', 'camelCase']
            });
        });
        it('should fail when directive used without longer prefix', function () {
            var source = "\n          @Directive({\n            selector: '[fooBar]'\n                      ~~~~~~~~~~\n          })\n          class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'directive-selector',
                message: 'The selector of the directive "Test" should have prefix "fo" ($$02-08$$)',
                source: source,
                options: ['attribute', 'fo', 'camelCase']
            });
        });
        it('should fail when directive used without prefix applying multiple prefixes', function () {
            var source = "\n          @Directive({\n            selector: '[fooBar]'\n                      ~~~~~~~~~~\n          })\n          class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'directive-selector',
                message: 'The selector of the directive "Test" should have one of the prefixes "sg, ng, mg" ($$02-08$$)',
                source: source,
                options: ['attribute', ['sg', 'ng', 'mg'], 'camelCase']
            });
        });
        it('should fail when directive used without prefix applying multiple prefixes and selectors', function () {
            var source = "\n          @Directive({\n            selector: 'baz.bar[fooBar]'\n                      ~~~~~~~~~~~~~~~~~\n          })\n          class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'directive-selector',
                message: 'The selector of the directive "Test" should have one of the prefixes "sg, ng, mg" ($$02-08$$)',
                source: source,
                options: ['attribute', ['sg', 'ng', 'mg'], 'camelCase']
            });
        });
    });
    describe('valid directive selector', function () {
        it('should succeed when set valid selector in @Directive', function () {
            var source = "\n      @Directive({\n        selector: '[sgBarFoo]'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('directive-selector', source, ['attribute', 'sg', 'camelCase']);
        });
        it('should succeed when set valid selector in @Directive', function () {
            var source = "\n      @Directive({\n        selector: 'sgBarFoo'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('directive-selector', source, [['attribute', 'element'], 'sg', 'camelCase']);
        });
        it('should succeed when set valid selector in @Directive using multiple prefixes', function () {
            var source = "\n      @Directive({\n        selector: '[ngBarFoo]'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('directive-selector', source, ['attribute', ['ng', 'sg', 'mg'], 'camelCase']);
        });
        it('should succeed when set valid selector in @Directive using multiple prefixes and selectors', function () {
            var source = "\n      @Directive({\n        selector: 'bar[ngBarFoo].baz'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('directive-selector', source, ['attribute', ['ng', 'sg', 'mg'], 'camelCase']);
        });
    });
});
describe('directive-selector-type', function () {
    describe('invalid directive selectors', function () {
        it('should fail when directive used as attribute', function () {
            var source = "\n      @Directive({\n        selector: 'foo-bar'\n                  ~~~~~~~~~\n      })\n      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'directive-selector',
                message: 'The selector of the directive "Test" should be used as attribute ($$02-06$$)',
                source: source,
                options: ['attribute', 'sg', 'camelCase']
            });
        });
    });
    describe('invalid directive selector, using multiple selectors', function () {
        it('should fail when set non attribute selectors in @Directive', function () {
            var source = "\n      @Directive({\n        selector: 'test.test:not(p)'\n                  ~~~~~~~~~~~~~~~~~~\n      })\n      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'directive-selector',
                message: 'The selector of the directive "Test" should be used as attribute ($$02-06$$)',
                source: source,
                options: ['attribute', 'sg', 'camelCase']
            });
        });
    });
    describe('valid directive selector', function () {
        it('should succeed when set valid selector in @Directive', function () {
            var source = "\n      @Directive({\n        selector: '[sgBarFoo]'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('directive-selector', source, ['attribute', 'sg', 'camelCase']);
        });
        it('should not validate @Component', function () {
            var source = "\n      @Component({\n        selector: 'sg-bar-foo'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('directive-selector', source, ['attribute', 'sg', 'camelCase']);
        });
        it('should succeed when set valid selector using multiple selectors in @Directive', function () {
            var source = "\n      @Directive({\n        selector: 'baz[sgBarFoo].bai'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('directive-selector', source, ['attribute', 'sg', 'camelCase']);
        });
        it('should succeed when set valid selector using multiple selectors in @Directive', function () {
            var source = "\n            @Directive({\n              selector: '[past][formControlName],[past][formControl],[past][ngModel]',\n              providers: [{\n                provide: NG_VALIDATORS,\n                useExisting: forwardRef(() => DatePastValidator),\n                multi: true,\n              }],\n              host: {'[attr.date]': 'date? \"\" : null'},\n            })\n            class Test {}";
            testHelper_1.assertSuccess('directive-selector', source, ['attribute', 'ng', 'camelCase']);
        });
    });
});
