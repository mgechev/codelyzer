"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var ngWalker_1 = require("../../src/angular/ngWalker");
var recursiveAngularExpressionVisitor_1 = require("../../src/angular/templates/recursiveAngularExpressionVisitor");
var basicTemplateAstVisitor_1 = require("../../src/angular/templates/basicTemplateAstVisitor");
var basicCssAstVisitor_1 = require("../../src/angular/styles/basicCssAstVisitor");
var chai = require("chai");
var spies = require("chai-spies");
chai.use(spies);
var chaiSpy = chai.spy;
describe('ngWalker', function () {
    it('should visit components and directives', function () {
        var source = "\n      @Component({\n        selector: 'foo',\n        template: 'bar'\n      })\n      class Baz {}\n      @Directive({\n        selector: '[baz]'\n      })\n      class Foobar {}\n    ";
        var ruleArgs = {
            ruleName: 'foo',
            ruleArguments: ['foo'],
            disabledIntervals: null,
            ruleSeverity: 'warning'
        };
        var sf = ts.createSourceFile('foo', source, null);
        var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
        var cmpSpy = chaiSpy.on(walker, 'visitNgComponent');
        var dirSpy = chaiSpy.on(walker, 'visitNgDirective');
        walker.walk(sf);
        chai.expect(cmpSpy).to.have.been.called();
        chai.expect(dirSpy).to.have.been.called();
    });
    it('should visit inputs and outputs with args', function () {
        var source = "\n      @Component({\n        selector: 'foo',\n      })\n      class Baz {\n        @Input('bar')\n        foo;\n        @Output('baz')\n        foobar;\n      }\n    ";
        var ruleArgs = {
            ruleName: 'foo',
            ruleArguments: ['foo'],
            disabledIntervals: null,
            ruleSeverity: 'warning'
        };
        var sf = ts.createSourceFile('foo', source, null);
        var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
        var outputsSpy = chaiSpy.on(walker, 'visitNgOutput');
        var inputsSpy = chaiSpy.on(walker, 'visitNgInput');
        walker.walk(sf);
        chai.expect(outputsSpy).to.have.been.called();
        chai.expect(inputsSpy).to.have.been.called();
    });
    it('should visit component templates', function () {
        var source = "\n      @Component({\n        selector: 'foo',\n        template: '<div></div>'\n      })\n      class Baz {}\n    ";
        var ruleArgs = {
            ruleName: 'foo',
            ruleArguments: ['foo'],
            disabledIntervals: null,
            ruleSeverity: 'warning'
        };
        var sf = ts.createSourceFile('foo', source, null);
        var walker = new ngWalker_1.NgWalker(sf, ruleArgs, {
            templateVisitorCtrl: basicTemplateAstVisitor_1.BasicTemplateAstVisitor
        });
        var templateSpy = chaiSpy.on(basicTemplateAstVisitor_1.BasicTemplateAstVisitor.prototype, 'visitElement');
        walker.walk(sf);
        chai.expect(templateSpy).to.have.been.called();
    });
    it('should visit component template expressions', function () {
        var source = "\n      @Component({\n        selector: 'foo',\n        template: '{{foo}}'\n      })\n      class Baz {}\n    ";
        var ruleArgs = {
            ruleName: 'foo',
            ruleArguments: ['foo'],
            disabledIntervals: null,
            ruleSeverity: 'warning'
        };
        var sf = ts.createSourceFile('foo', source, null);
        var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
        var templateSpy = chaiSpy.on(recursiveAngularExpressionVisitor_1.RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
        walker.walk(sf);
        chai.expect(templateSpy).to.have.been.called();
    });
    it('should not thow when a template is not literal', function () {
        var source = "\n      const template = '{{foo}}';\n      @Component({\n        selector: 'foo',\n        template: template\n      })\n      class Baz {}\n    ";
        var ruleArgs = {
            ruleName: 'foo',
            ruleArguments: ['foo'],
            disabledIntervals: null,
            ruleSeverity: 'warning'
        };
        var sf = ts.createSourceFile('foo', source, null);
        var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
        chai.expect(function () {
            var templateSpy = chaiSpy.on(recursiveAngularExpressionVisitor_1.RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
            walker.walk(sf);
            chai.expect(templateSpy).to.not.have.been.called();
        }).not.to.throw();
    });
    it('should not thow when a template is dynamically injected', function () {
        var source = "\n      const template = '{{foo}}';\n      @Component({\n        selector: 'foo',\n        template: require('template') as string\n      })\n      class Baz {}\n    ";
        var ruleArgs = {
            ruleName: 'foo',
            ruleArguments: ['foo'],
            disabledIntervals: null,
            ruleSeverity: 'warning'
        };
        var sf = ts.createSourceFile('foo', source, null);
        var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
        chai.expect(function () {
            var templateSpy = chaiSpy.on(recursiveAngularExpressionVisitor_1.RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
            walker.walk(sf);
            chai.expect(templateSpy).to.not.have.been.called();
        }).not.to.throw();
    });
    it('should not thow when a template is template string', function () {
        var source = "\n      const template = '{{foo}}';\n      @Component({\n        selector: 'foo',\n        template: `foo ${test} `\n      })\n      class Baz {}\n    ";
        var ruleArgs = {
            ruleName: 'foo',
            ruleArguments: ['foo'],
            disabledIntervals: null,
            ruleSeverity: 'warning'
        };
        var sf = ts.createSourceFile('foo', source, null);
        var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
        chai.expect(function () {
            var templateSpy = chaiSpy.on(recursiveAngularExpressionVisitor_1.RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
            walker.walk(sf);
            chai.expect(templateSpy).to.not.have.been.called();
        }).not.to.throw();
    });
    it('should ignore templateUrl', function () {
        var source = "\n      @Component({\n        selector: 'foo',\n        templateUrl: 'test.html'\n      })\n      class Baz {}\n    ";
        var ruleArgs = {
            ruleName: 'foo',
            ruleArguments: ['foo'],
            disabledIntervals: null,
            ruleSeverity: 'warning'
        };
        var sf = ts.createSourceFile('foo', source, null);
        var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
        chai.expect(function () {
            var templateSpy = chaiSpy.on(recursiveAngularExpressionVisitor_1.RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
            walker.walk(sf);
            chai.expect(templateSpy).to.not.have.been.called();
        }).not.to.throw();
    });
    it('should ignore empty @Component decorator', function () {
        var source = "\n      @Component()\n      class Baz {}\n    ";
        var ruleArgs = {
            ruleName: 'foo',
            ruleArguments: ['foo'],
            disabledIntervals: null,
            ruleSeverity: 'warning'
        };
        var sf = ts.createSourceFile('foo', source, null);
        var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
        chai.expect(function () {
            var templateSpy = chaiSpy.on(recursiveAngularExpressionVisitor_1.RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
            walker.walk(sf);
            chai.expect(templateSpy).to.not.have.been.called();
        }).not.to.throw();
    });
    it('should ignore non-invoked @Component decorator', function () {
        var source = "\n      @Component\n      class Baz {}\n    ";
        var ruleArgs = {
            ruleName: 'foo',
            ruleArguments: ['foo'],
            disabledIntervals: null,
            ruleSeverity: 'warning'
        };
        var sf = ts.createSourceFile('foo', source, null);
        var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
        chai.expect(function () {
            walker.walk(sf);
        }).not.to.throw();
    });
    describe('inline styles', function () {
        it('should not throw when there are inline styles', function () {
            var source = "\n        @Component({\n          styles: [\n            `foo`\n          ]\n        })\n        class Baz {}\n      ";
            var ruleArgs = {
                ruleName: 'foo',
                ruleArguments: ['foo'],
                disabledIntervals: null,
                ruleSeverity: 'warning'
            };
            var sf = ts.createSourceFile('foo', source, null);
            var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
            chai.expect(function () {
                walker.walk(sf);
            }).not.to.throw();
        });
        it('should use the default css walker by default', function () {
            var source = "\n        @Component({\n          styles: [\n            `foo`\n          ]\n        })\n        class Baz {}\n      ";
            var ruleArgs = {
                ruleName: 'foo',
                ruleArguments: ['foo'],
                disabledIntervals: null,
                ruleSeverity: 'warning'
            };
            var sf = ts.createSourceFile('foo', source, null);
            var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
            chai.expect(function () {
                var templateSpy = chaiSpy.on(basicCssAstVisitor_1.BasicCssAstVisitor.prototype, 'visitCssStyleSheet');
                walker.walk(sf);
                chai.expect(templateSpy).to.have.been.called();
            }).not.to.throw();
        });
        it('should not break', function () {
            var source = "\n        export class Main {\n\n          constructor() {\n\n          }\n\n          regExp() {\n            // complaining about missing whitespace after coma in regex\n            const test = /${0,1}/.test('not important$');\n            console.log(test);\n          }\n\n          stringLiteral() {\n            const offset = \"3\";\n            // complaining about missing whitespace inside of string literal\n            const test = `<path d=\"M${offset},${offset}\">`;\n            console.log(test);\n          }\n        }\n\n        // compains about missing semicolon at end\n        export class WantsSemiColonAtEndOfClass {\n          constructor() {\n\n          }\n        }\n      ";
            var ruleArgs = {
                ruleName: 'foo',
                ruleArguments: ['foo'],
                disabledIntervals: null,
                ruleSeverity: 'warning'
            };
            var sf = ts.createSourceFile('foo', source, null);
            var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
            chai.expect(function () {
                walker.walk(sf);
            }).not.to.throw();
        });
    });
});
