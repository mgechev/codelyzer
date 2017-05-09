"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var sass = require("node-sass");
var testHelper_1 = require("./testHelper");
var config_1 = require("../src/angular/config");
describe('no-unused-css', function () {
    describe('valid cases', function () {
        it('should succeed when having valid simple selector', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: '<div bar=\"{{baz}}\" [ngClass]=\"expr\">{{ foo }}</div>',\n          styles: [\n            `\n            div {\n              color: red;\n            }\n            `\n          ]\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertSuccess('no-unused-css', source);
        });
        describe('complex selectors', function () {
            it('should succeed when having valid complex selector', function () {
                var source = "\n          @Component({\n            selector: 'foobar',\n            template: `<div>\n              <section>\n                <span><h1>{{ foo }}</h1></span>\n              </section>\n            </div>`,\n            styles: [\n              `\n              div h1 {\n                color: red;\n              }\n              `\n            ]\n          })\n          class Test {\n            bar: number;\n          }";
                testHelper_1.assertSuccess('no-unused-css', source);
            });
            it('should succeed when having valid complex selector', function () {
                var source = "\n          @Component({\n            selector: 'foobar',\n            template: `<div [class.bar]=\"true\"></div>`,\n            styles: [\n              `\n              div.bar {\n                color: red;\n              }\n              `\n            ]\n          })\n          class Test {\n            bar: number;\n          }";
                testHelper_1.assertSuccess('no-unused-css', source);
            });
            it('should succeed when having valid complex selector', function () {
                var source = "\n          @Component({\n            selector: 'foobar',\n            template: `<div>\n              <section>\n                <span><h1 id=\"header\">{{ foo }}</h1></span>\n              </section>\n            </div>`,\n            styles: [\n              `\n              div h1#header {\n                color: red;\n              }\n              `\n            ]\n          })\n          class Test {\n            bar: number;\n          }";
                testHelper_1.assertSuccess('no-unused-css', source);
            });
            it('should succeed for structural directives when selector matches', function () {
                var source = "\n          @Component({\n            selector: 'foobar',\n            template: `<div>\n              <section>\n                <span><h1>{{ foo }}</h1></span>\n              </section>\n            </div>`,\n            styles: [\n              `\n              div h1 {\n                color: red;\n              }\n              `\n            ]\n          })\n          class Test {\n            bar: number;\n          }";
                testHelper_1.assertSuccess('no-unused-css', source);
            });
            describe('multiple styles', function () {
                it('should succeed when having valid complex selector', function () {
                    var source = "\n            @Component({\n              selector: 'foobar',\n              template: `<div>\n                <section>\n                  <span><h1 id=\"header\">{{ foo }}</h1></span>\n                </section>\n              </div>`,\n              styles: [\n                `\n                div h1#header {\n                  color: red;\n                }\n                `,\n                `\n                #header {\n                  font-size: 10px;\n                }\n                `\n              ]\n            })\n            class Test {\n              bar: number;\n            }";
                    testHelper_1.assertSuccess('no-unused-css', source);
                });
            });
        });
        describe('class setter', function () {
            it('should succeed when having valid complex selector', function () {
                var source = "\n          @Component({\n            selector: 'foobar',\n            template: `<div>\n              <section>\n                <span><h1 [class.header]=\"bar\">{{ foo }}</h1></span>\n              </section>\n            </div>`,\n            styles: [\n              `\n              div h1.header {\n                color: red;\n              }\n              `\n            ]\n          })\n          class Test {\n            bar: number;\n          }";
                testHelper_1.assertSuccess('no-unused-css', source);
            });
        });
        describe('dynamic classes', function () {
            it('should skip components with dynamically set classes', function () {
                var source = "\n          @Component({\n            selector: 'foobar',\n            template: `<div>\n              <section class=\"bar {{baz}}\">\n                <span><h1 [attr.id]=\"invalid\">{{ foo }}</h1></span>\n              </section>\n            </div>`,\n            styles: [\n              `\n              div h1#header {\n                color: red;\n              }\n              `\n            ]\n          })\n          class Test {\n            bar: number;\n          }";
                testHelper_1.assertSuccess('no-unused-css', source);
            });
            it('should skip components with dynamically set classes', function () {
                var source = "\n          @Component({\n            selector: 'foobar',\n            template: `<div>\n              <section [ngClass]=\"{ 'bar': true }\">\n                <span><h1 id=\"{{invalid}}\">{{ foo }}</h1></span>\n              </section>\n            </div>`,\n            styles: [\n              `\n              div h1#header {\n                color: red;\n              }\n              `\n            ]\n          })\n          class Test {\n            bar: number;\n          }";
                testHelper_1.assertSuccess('no-unused-css', source);
            });
        });
    });
    describe('failures', function () {
        it('should fail when having a complex selector that doesn\'t match anything', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div>\n            <section>\n              <span><h1>{{ foo }}</h1></span>\n            </section>\n          </div>`,\n          styles: [\n            `\n            div h2 {\n            ~~~~~~~~\n              color: red;\n            }\n            ~\n            `\n          ]\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-unused-css',
                message: 'Unused styles',
                source: source
            });
        });
        it('should fail with multiple styles', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div>\n            <section>\n              <span><h2>{{ foo }}</h2></span>\n            </section>\n          </div>`,\n          styles: [\n            `\n            div h2 {\n              color: red;\n            }\n            `,\n            `\n            h1 {\n            ~~~~\n              color: black;\n            }\n            ~\n            `\n          ]\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-unused-css',
                message: 'Unused styles',
                source: source
            });
        });
        it('should fail when dynamic selector of not the proper type is used', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div>\n            <section class=\"bar\">\n              <span><h1 [attr.id]=\"bar\">{{ foo }}</h1></span>\n            </section>\n          </div>`,\n          styles: [\n            `\n            div section.bar h2 {\n            ~~~~~~~~~~~~~~~~~~~~\n              color: red;\n            }\n            ~\n            `\n          ]\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-unused-css',
                message: 'Unused styles',
                source: source
            });
        });
        it('should fail for structural directives when selector does not match', function () {
            var source = "\n          @Component({\n            selector: 'foobar',\n            template: `<div>\n              <section>\n                <span><h1 *ngIf=\"true\">{{ foo }}</h1></span>\n              </section>\n            </div>`,\n            styles: [\n              `\n              div h1#header {\n              ~~~~~~~~~~~~~~~\n                color: red;\n              }\n              ~\n              `\n            ]\n          })\n          class Test {\n            bar: number;\n          }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-unused-css',
                message: 'Unused styles',
                source: source
            });
        });
        describe('class setter', function () {
            it('should succeed when having valid complex selector', function () {
                var source = "\n          @Component({\n            selector: 'foobar',\n            template: `<div>\n              <section>\n                <span><h1 [class.head]=\"bar\">{{ foo }}</h1></span>\n              </section>\n            </div>`,\n            styles: [\n              `\n              div h1.header {\n              ~~~~~~~~~~~~~~~\n                color: red;\n              }\n              ~\n              `\n            ]\n          })\n          class Test {\n            bar: number;\n          }";
                testHelper_1.assertAnnotated({
                    ruleName: 'no-unused-css',
                    message: 'Unused styles',
                    source: source
                });
            });
        });
    });
    describe('host', function () {
        it('should never fail for :host', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div>\n            <section>\n              <span><h1 [class.header]=\"bar\">{{ foo }}</h1></span>\n            </section>\n          </div>`,\n          styles: [\n            `\n            :host {\n              color: red;\n            }\n            `\n          ]\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertSuccess('no-unused-css', source);
        });
        it('should fail when not matched selectors after :host', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div>\n            <section>\n              <span><h1 [class.header]=\"bar\">{{ foo }}</h1></span>\n            </section>\n          </div>`,\n          styles: [\n            `\n            :host section h2 {\n            ~~~~~~~~~~~~~~~~~~\n              color: red;\n            }\n            ~\n            `\n          ]\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-unused-css',
                message: 'Unused styles',
                source: source
            });
        });
    });
    describe('deep and >>>', function () {
        it('should ignore deep and match only before it', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div>\n            <section>\n              <span><h1 [class.header]=\"bar\">{{ foo }}</h1></span>\n            </section>\n          </div>`,\n          styles: [\n            `\n            div section /deep/ h2 {\n              color: red;\n            }\n            `\n          ]\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertSuccess('no-unused-css', source);
        });
        it('should match before reaching deep', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div>\n            <content>\n              <span><h1 [class.header]=\"bar\">{{ foo }}</h1></span>\n            </content>\n          </div>`,\n          styles: [\n            `\n            div section /deep/ h2 {\n            ~~~~~~~~~~~~~~~~~~~~~~~\n              color: red;\n            }\n            ~\n            `\n          ]\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-unused-css',
                message: 'Unused styles',
                source: source
            });
        });
        it('should ignore deep and match only before it', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div>\n            <section>\n              <span><h1 [class.header]=\"bar\">{{ foo }}</h1></span>\n            </section>\n          </div>`,\n          styles: [\n            `\n            div section >>> h2 {\n              color: red;\n            }\n            `\n          ]\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertSuccess('no-unused-css', source);
        });
        it('should match before reaching deep', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div>\n            <content>\n              <span><h1 [class.header]=\"bar\">{{ foo }}</h1></span>\n            </content>\n          </div>`,\n          styles: [\n            `\n            div section >>> h2 {\n            ~~~~~~~~~~~~~~~~~~~~\n              color: red;\n            }\n            ~\n            `\n          ]\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-unused-css',
                message: 'Unused styles',
                source: source
            });
        });
    });
    describe('pseudo', function () {
        it('should ignore before and after', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div>\n            <section>\n              <span><h1 [class.header]=\"bar\">{{ foo }}</h1></span>\n            </section>\n          </div>`,\n          styles: [\n            `\n            div section::before {\n              color: red;\n            }\n            `\n          ]\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertSuccess('no-unused-css', source);
        });
        it('should ignore before and after', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          template: `<div>\n            <section>\n              <span><h1 [class.header]=\"bar\">{{ foo }}</h1></span>\n            </section>\n          </div>`,\n          styles: [\n            `\n            div content::before {\n            ~~~~~~~~~~~~~~~~~~~~~\n              color: red;\n            }\n            ~\n            `\n          ]\n        })\n        class Test {\n          bar: number;\n        }";
            testHelper_1.assertAnnotated({
                ruleName: 'no-unused-css',
                message: 'Unused styles',
                source: source
            });
        });
    });
    describe('ViewEncapsulation', function () {
        it('should ignore before and after', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          encapsulation: whatever,\n          template: `<div></div>`,\n          styles: [\n            `\n            p {\n              color: red;\n            }\n            `\n          ]\n        })\n        class Test {}";
            testHelper_1.assertSuccess('no-unused-css', source);
        });
        it('should ignore before and after', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          encapsulation: ViewEncapsulation.None,\n          template: `<div></div>`,\n          styles: [\n            `\n            p {\n              color: red;\n            }\n            `\n          ]\n        })\n        class Test {}";
            testHelper_1.assertSuccess('no-unused-css', source);
        });
        it('should ignore before and after', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          encapsulation: ViewEncapsulation.Native,\n          template: `<div></div>`,\n          styles: [\n            `\n            p {\n            ~~~\n              color: red;\n            }\n            ~\n            `\n          ]\n        })\n        class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'no-unused-css',
                message: 'Unused styles',
                source: source
            });
        });
        it('should ignore before and after', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          encapsulation: ViewEncapsulation.Emulated,\n          template: `<div></div>`,\n          styles: [\n            `\n            p {\n            ~~~\n              color: red;\n            }\n            ~\n            `\n          ]\n        })\n        class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'no-unused-css',
                message: 'Unused styles',
                source: source
            });
        });
        it('should ignore before and after', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          encapsulation: prefix.foo.ViewEncapsulation.Emulated,\n          template: `<div></div>`,\n          styles: [\n            `\n            p {\n            ~~~\n              color: red;\n            }\n            ~\n            `\n          ]\n        })\n        class Test {}";
            testHelper_1.assertAnnotated({
                ruleName: 'no-unused-css',
                message: 'Unused styles',
                source: source
            });
        });
    });
    it('should work with sass', function () {
        config_1.Config.transformStyle = function (source, url, d) {
            var res = sass.renderSync({
                sourceMap: true, data: source, sourceMapEmbed: true
            });
            var code = res.css.toString();
            var base64Map = code.match(/\/\*(.*?)\*\//)[1].replace('# sourceMappingURL=data:application/json;base64,', '');
            var map = JSON.parse(new Buffer(base64Map, 'base64').toString('ascii'));
            return { code: code, source: source, map: map };
        };
        var source = "\n    @Component({\n      selector: 'hero-cmp',\n      template: `\n        <h1>Hello <span>{{ hero.name }}</span></h1>\n      `,\n      styles: [\n        `\n        h1 {\n       ~~~~~\n          spam {\n            baz {\n              color: red;\n            }\n           ~\n          }\n        }\n        `\n      ]\n    })\n    class HeroComponent {\n      private hero: Hero;\n    }";
        testHelper_1.assertAnnotated({
            ruleName: 'no-unused-css',
            message: 'Unused styles',
            source: source
        });
        config_1.Config.transformStyle = function (code) { return ({ code: code, map: null }); };
    });
    describe('inconsistencies with template', function () {
        it('should ignore misspelled template', function () {
            var source = "\n      @Component({\n        selector: 'hero-cmp',\n        templae: `\n          <h1>Hello <span>{{ hero.name }}</span></h1>\n        `,\n        styles: [\n          `\n          h1 spam {\n            color: red;\n          }\n          `\n        ]\n      })\n      class HeroComponent {\n        private hero: Hero;\n      }";
            testHelper_1.assertSuccess('no-unused-css', source);
        });
    });
    describe('autofixes', function () {
        it('should work with regular CSS', function () {
            var source = "\n        @Component({\n          selector: 'foobar',\n          encapsulation: prefix.foo.ViewEncapsulation.Emulated,\n          template: `<div></div>`,\n          styles: [\n            `\n            p {\n              color: red;\n            }\n            `\n          ]\n        })\n        class Test {}";
            var failures = testHelper_1.assertFailure('no-unused-css', source, {
                message: 'Unused styles',
                startPosition: {
                    line: 7,
                    character: 12
                },
                endPosition: {
                    line: 9,
                    character: 13
                }
            }, null);
            var replacement = failures[0].getFix();
            chai_1.expect(replacement.text).to.eq('');
            chai_1.expect(replacement.start).to.eq(197);
            chai_1.expect(replacement.end).to.eq(240);
        });
        it('should work with SASS', function () {
            config_1.Config.transformStyle = function (source, url, d) {
                var res = sass.renderSync({
                    sourceMap: true, data: source, sourceMapEmbed: true
                });
                var code = res.css.toString();
                var base64Map = code.match(/\/\*(.*?)\*\//)[1].replace('# sourceMappingURL=data:application/json;base64,', '');
                var map = JSON.parse(new Buffer(base64Map, 'base64').toString('ascii'));
                return { code: code, source: source, map: map };
            };
            var source = "\n      @Component({\n        selector: 'hero-cmp',\n        template: `\n          <h1>Hello <span>{{ hero.name }}</span></h1>\n        `,\n        styles: [\n          `\n          h1 {\n            spam {\n              baz {\n                color: red;\n              }\n            }\n          }\n          `\n        ]\n      })\n      class HeroComponent {\n        private hero: Hero;\n      }";
            var failures = testHelper_1.assertFailure('no-unused-css', source, {
                message: 'Unused styles',
                startPosition: {
                    line: 8,
                    character: 9
                },
                endPosition: {
                    line: 12,
                    character: 14
                }
            });
            config_1.Config.transformStyle = function (code) { return ({ code: code, map: null }); };
            var replacement = failures[0].getFix();
            chai_1.expect(replacement.text).to.eq('');
            chai_1.expect(replacement.start).to.eq(174);
            chai_1.expect(replacement.end).to.eq(261);
        });
    });
});
