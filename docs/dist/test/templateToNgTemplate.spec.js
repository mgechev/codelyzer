"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
var tslint_1 = require("tslint");
var chai = require("chai");
describe('template-to-ng-template', function () {
    it('should skip elements with *-prefixed attr', function () {
        var source = "\n      @Component({\n        selector: 'foobar',\n        template: '<section><div *ngIf=\"42\"></div></section>'\n      })\n      class Test {}";
        testHelper_1.assertSuccess('template-to-ng-template', source);
    });
    it('should detect template elements', function () {
        var source = "\n      @Component({\n        selector: 'foobar',\n        template: '<section><template [ngForOf]></template></div>'\n                            ~~~~~~~~~~~~~~~~~~~~\n      })\n      class Test {}";
        testHelper_1.assertAnnotated({
            ruleName: 'template-to-ng-template',
            message: 'You should use <ng-template> instead of <template>',
            source: source
        });
    });
    it('should detect template elements', function () {
        var source = "\n      @Component({\n        selector: 'foobar',\n        template: '<section><template [ngForOf]><br></template></div>'\n                            ~~~~~~~~~~~~~~~~~~~~\n      })\n      class Test {}";
        testHelper_1.assertAnnotated({
            ruleName: 'template-to-ng-template',
            message: 'You should use <ng-template> instead of <template>',
            source: source
        });
    });
    it('should detect template elements', function () {
        var source = "\n      @Component({\n        selector: 'foobar',\n        template: `<section>\n          <template [ngForOf]><div/>\n          ~~~~~~~~~~~~~~~~~~~~\n          </template></div>`\n      })\n      class Test {}";
        testHelper_1.assertAnnotated({
            ruleName: 'template-to-ng-template',
            message: 'You should use <ng-template> instead of <template>',
            source: source
        });
    });
    xdescribe('auto-fixes', function () {
        it('should not auto-fix template sugar', function () {
            var source = "\n      @Component({\n        selector: 'foobar',\n        template: '<section><div *ngIf=\"42\"></div></section>'\n      })\n      class Test {}";
            testHelper_1.assertSuccess('template-to-ng-template', source);
        });
        it('should fix template with no sugar', function () {
            var source = "\n      @Component({\n        selector: 'foobar',\n        template: '<div></div><template></template><template></template>'\n                              ~~~~~~~~~~\n      })\n      class Test {}";
            var failures = testHelper_1.assertAnnotated({
                ruleName: 'template-to-ng-template',
                source: source,
                message: 'You should use <ng-template> instead of <template>'
            });
            chai.expect(failures[0].hasFix()).to.eq(true);
            var replacements = [failures[0].getFix()].concat(failures[1].getFix());
            chai.expect(replacements[0].replacements.length).to.eq(2);
            var res = tslint_1.Replacement.applyAll(source, replacements);
            var expected = "\n      @Component({\n        selector: 'foobar',\n        template: '<div></div><ng-template></ng-template><ng-template></ng-template>'\n                              ~~~~~~~~~~\n      })\n      class Test {}";
            chai.expect(res).to.eq(expected);
        });
        it('should fix template with no sugar & nested templates', function () {
            var source = "\n      @Component({\n        selector: 'foobar',\n        template: '<div></div><template><template></template></template>'\n                              ~~~~~~~~~~\n      })\n      class Test {}";
            var failures = testHelper_1.assertAnnotated({
                ruleName: 'template-to-ng-template',
                source: source,
                message: 'You should use <ng-template> instead of <template>'
            });
            chai.expect(failures[0].hasFix()).to.eq(true);
            chai.expect(failures.length).to.eq(2);
            var replacements = [failures[0].getFix()].concat(failures[1].getFix());
            chai.expect(replacements[0].replacements.length).to.eq(2);
            chai.expect(replacements[1].replacements.length).to.eq(2);
            var res = tslint_1.Replacement.applyAll(source, replacements);
            var expected = "\n      @Component({\n        selector: 'foobar',\n        template: '<div></div><ng-template><ng-template></ng-template></ng-template>'\n                              ~~~~~~~~~~\n      })\n      class Test {}";
            chai.expect(res).to.eq(expected);
        });
        it('should fix template with templates & sugar', function () {
            var source = "\n      @Component({\n        selector: 'foobar',\n        template: `\n          <div *ngIf=\"bar\"></div>\n          <template>\n          </template>`\n      })\n      class Test {}";
            var failures = testHelper_1.assertFailure('template-to-ng-template', source, {
                message: 'You should use <ng-template> instead of <template>',
                startPosition: {
                    line: 5,
                    character: 10
                },
                endPosition: {
                    line: 5,
                    character: 20
                }
            });
            chai.expect(failures[0].hasFix()).to.eq(true);
            chai.expect(failures.length).to.eq(1);
            var replacements = failures[0].getFix();
            if (!(replacements instanceof Array)) {
                replacements = [replacements];
            }
            var res = tslint_1.Replacement.applyAll(source, replacements);
            var expected = "\n      @Component({\n        selector: 'foobar',\n        template: `\n          <div *ngIf=\"bar\"></div>\n          <ng-template>\n          </ng-template>`\n      })\n      class Test {}";
            chai.expect(res).to.eq(expected);
        });
        it('should fix template with no sugar & nested templates & nested elements', function () {
            var source = "\n      @Component({\n        selector: 'foobar',\n        template: `\n          <template>\n            <template>\n              <div *ngIf=\"foo\"></div>\n            </template>\n            <template>\n              <div><span>\n              </span></div>\n            </template>\n          </template>\n        `\n      })\n      class Test {}";
            var failures = testHelper_1.assertFailure('template-to-ng-template', source, {
                message: 'You should use <ng-template> instead of <template>',
                startPosition: {
                    line: 4,
                    character: 10
                },
                endPosition: {
                    line: 4,
                    character: 20
                }
            });
            chai.expect(failures.length).to.eq(3);
            chai.expect(failures[0].hasFix()).to.eq(true);
            var replacements = failures[0].getFix();
            if (!(replacements instanceof Array)) {
                replacements = [replacements];
            }
            chai.expect(replacements.length).to.eq(2);
            var res = tslint_1.Replacement.applyAll(source, failures.map(function (f) { return f.getFix(); }));
            var expected = "\n      @Component({\n        selector: 'foobar',\n        template: `\n          <ng-template>\n            <ng-template>\n              <div *ngIf=\"foo\"></div>\n            </ng-template>\n            <ng-template>\n              <div><span>\n              </span></div>\n            </ng-template>\n          </ng-template>\n        `\n      })\n      class Test {}";
            chai.expect(res).to.eq(expected);
        });
        it('should fix template with no sugar & nested templates & nested elements', function () {
            var source = "\n      @Component({\n        selector: 'foobar',\n        template: `\n          <template>\n            <template></template>\n          </template>\n          <template></template>\n        `\n      })\n      class Test {}";
            var failures = testHelper_1.assertFailure('template-to-ng-template', source, {
                message: 'You should use <ng-template> instead of <template>',
                startPosition: {
                    line: 4,
                    character: 10
                },
                endPosition: {
                    line: 4,
                    character: 20
                }
            });
            chai.expect(failures[0].hasFix()).to.eq(true);
            var replacements = failures[0].getFix();
            if (!(replacements instanceof Array)) {
                replacements = [replacements];
            }
            chai.expect(replacements.length).to.eq(2);
            chai.expect(failures.length).to.eq(3);
            var res = tslint_1.Replacement.applyAll(source, [].concat.apply([], failures.map(function (f) {
                var fix = f.getFix();
                if (!(fix instanceof Array)) {
                    fix = [fix];
                }
                return fix;
            })));
            var expected = "\n      @Component({\n        selector: 'foobar',\n        template: `\n          <ng-template>\n            <ng-template></ng-template>\n          </ng-template>\n          <ng-template></ng-template>\n        `\n      })\n      class Test {}";
            chai.expect(res).to.eq(expected);
        });
        it('should fix template with no sugar & nested templates & nested elements', function () {
            var source = "\n      @Component({\n        selector: 'foobar',\n        template: `\n          <div *ngIf=\"foo\">\n            <template></template>\n          </div>\n        `\n      })\n      class Test {}";
            var failures = testHelper_1.assertFailure('template-to-ng-template', source, {
                message: 'You should use <ng-template> instead of <template>',
                startPosition: {
                    line: 5,
                    character: 12
                },
                endPosition: {
                    line: 5,
                    character: 22
                }
            });
            chai.expect(failures[0].hasFix()).to.eq(true);
            var replacements = failures[0].getFix();
            if (!(replacements instanceof Array)) {
                replacements = [replacements];
            }
            chai.expect(replacements.length).to.eq(2);
            var reps = replacements;
            var res = tslint_1.Replacement.applyAll(source, replacements);
            var expected = "\n      @Component({\n        selector: 'foobar',\n        template: `\n          <div *ngIf=\"foo\">\n            <ng-template></ng-template>\n          </div>\n        `\n      })\n      class Test {}";
            chai.expect(res).to.eq(expected);
        });
    });
});
