"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('component-selector-prefix', function () {
    describe('invalid component selectors', function () {
        it('should fail when component used without prefix', function () {
            var source = "\n          @Component({\n            selector: 'foo-bar'\n                      ~~~~~~~~~\n          })\n          class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'component-selector',
                message: 'The selector of the component "Test" should have prefix "sg" ($$02-07$$)',
                source: source,
                options: ['element', 'sg', 'kebab-case']
            });
        });
        it('should fail when component used without prefix applying multiple prefixes', function () {
            var source = "\n          @Component({\n            selector: 'foo-bar'\n                      ~~~~~~~~~\n          })\n      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'component-selector',
                message: 'The selector of the component "Test" should have one of the prefixes "sg, mg, ng" ($$02-07$$)',
                source: source,
                options: ['element', ['sg', 'mg', 'ng'], 'kebab-case']
            });
        });
        it('should fail when component used without prefix applying multiple prefixes and selectors', function () {
            var source = "\n          @Component({\n            selector: 'foo-bar[baz].bar'\n                      ~~~~~~~~~~~~~~~~~~\n          })\n      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'component-selector',
                message: 'The selector of the component "Test" should have one of the prefixes "sg, mg, ng" ($$02-07$$)',
                source: source,
                options: ['element', ['sg', 'mg', 'ng'], 'kebab-case']
            });
        });
        it('should fail when component used longer prefix', function () {
            var source = "\n          @Component({selector: 'foo-bar'}) class TestOne {}\n                                ~~~~~~~~~\n          @Component({selector: 'ngg-bar'}) class TestTwo {}\n                                ^^^^^^^^^\n          ";
            testHelper_1.assertMultipleAnnotated({
                ruleName: 'component-selector',
                failures: [
                    { char: '~', msg: 'The selector of the component "TestOne" should have one of the prefixes "fo, mg, ng" ($$02-07$$)' },
                    { char: '^', msg: 'The selector of the component "TestTwo" should have one of the prefixes "fo, mg, ng" ($$02-07$$)' },
                ],
                source: source,
                options: ['element', ['fo', 'mg', 'ng'], 'kebab-case']
            });
        });
    });
    describe('valid component selector', function () {
        it('should succeed when set valid selector in @Component', function () {
            var source = "\n      @Component({\n        selector: 'sg-bar-foo'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('component-selector', source, ['element', 'sg', 'kebab-case']);
        });
        it('should succeed when set valid selector in @Component using multiple prefixes', function () {
            var source = "\n      @Component({\n        selector: 'sg-bar-foo'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('component-selector', source, ['element', ['sg', 'ng', 'mg'], 'kebab-case']);
        });
        it('should succeed when set valid selector in @Component using multiple prefixes and some prefixes are substring of others', function () {
            var source = "\n      @Component({\n        selector: 'abc-bar-foo'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('component-selector', source, ['element', ['ab', 'abc', 'mg'], 'kebab-case']);
        });
        it('should succeed without prefix', function () {
            var source = "\n      @Component({\n        selector: 'sg-bar-foo'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('component-selector', source, ['element', [], 'kebab-case']);
        });
        it('should succeed with null prefix', function () {
            var source = "\n      @Component({\n        selector: 'sg-bar-foo'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('component-selector', source, ['element', null, 'kebab-case']);
        });
        it('should succeed when set valid selector in @Component using multiple prefixes and attribute type', function () {
            var source = "\n      @Component({\n        selector: '[sg-bar-foo]'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('component-selector', source, ['attribute', ['sg', 'ng', 'mg'], 'kebab-case']);
        });
    });
});
describe('component-selector-type', function () {
    describe('invalid component selectors', function () {
        it('should fail when component used as attribute', function () {
            var source = "\n      @Component({\n        selector: '[fooBar]'\n                  ~~~~~~~~~~\n      })\n      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'component-selector',
                message: 'The selector of the component "Test" should be used as element ($$05-03$$)',
                source: source,
                options: ['element', ['sg', 'ng'], 'kebab-case']
            });
        });
        it("should properly handle es6 template literals", function () {
            var source = "\n      @Component({\n        selector: `[fooBar]`\n                  ~~~~~~~~~~\n      })\n      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'component-selector',
                message: 'The selector of the component "Test" should be used as element ($$05-03$$)',
                source: source,
                options: ['element', ['sg', 'ng'], 'kebab-case']
            });
        });
        it('should accept several selector types', function () {
            var source = "\n          @Component({\n            selector: `[fooBar]`\n          })\n          class Test {}";
            testHelper_1.assertSuccess('component-selector', source, [['element', 'attribute'], ['foo', 'ng'], 'camelCase']);
        });
    });
    describe('valid component selector', function () {
        it('should succeed when set valid selector in @Component', function () {
            var source = "\n      @Component({\n        selector: 'sg-bar-foo'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('component-selector', source, ['element', ['sg', 'ng'], 'kebab-case']);
        });
        it('should succeed when set valid selector in @Component with multiple selectors', function () {
            var source = "\n      @Component({\n        selector: 'sg-bar-foo[baz].bar'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('component-selector', source, ['element', ['sg', 'ng'], 'kebab-case']);
        });
        it('should succeed when set valid selector in @Component with multiple selectors and attribute type', function () {
            var source = "\n      @Component({\n        selector: 'baz[sg-bar-foo][foe].bar'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('component-selector', source, ['attribute', ['sg', 'ng'], 'kebab-case']);
        });
    });
});
describe('component-selector-name', function () {
    describe('invalid component selectors', function () {
        it('should fail when component named camelCase', function () {
            var source = "\n      @Component({\n        selector: 'sgFooBar'\n                  ~~~~~~~~~~\n      })\n      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'component-selector',
                message: 'The selector of the component "Test" should be named kebab-case and include dash ($$05-02$$)',
                source: source,
                options: ['element', 'sg', 'kebab-case']
            });
        });
        it('should fail when the selector of component does not contain hyphen character', function () {
            var source = "\n      @Component({\n        selector: 'sgfoobar'\n                  ~~~~~~~~~~\n      })\n      class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'component-selector',
                message: 'The selector of the component "Test" should be named kebab-case and include dash ($$05-02$$)',
                source: source,
                options: ['element', 'sg', 'kebab-case']
            });
        });
    });
    describe('valid component selector', function () {
        it('should succeed when set valid selector in @Component', function () {
            var source = "\n      @Component({\n        selector: 'sg-bar-foo'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('component-selector', source, ['element', 'sg', 'kebab-case']);
        });
        it('should succeed with empty file', function () {
            var source = "";
            testHelper_1.assertSuccess('component-selector', source, ['element', 'sg', 'kebab-case']);
        });
        it('should ignore the selector when it\'s not literal', function () {
            var source = "\n      const selectorName = 'sgFooBar';\n      @Component({\n        selector: selectorName\n      })\n      class Test {}";
            testHelper_1.assertSuccess('component-selector', source, ['element', 'sg', 'kebab-case']);
        });
        it('should succeed when set valid selector in @Component with multi selectors, attribute type and camelCase', function () {
            var source = "\n      @Component({\n        selector: 'baz[sgBarFoo][baz].baz'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('component-selector', source, ['attribute', 'sg', 'camelCase']);
        });
    });
});
