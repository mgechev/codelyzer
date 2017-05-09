"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var ngWalker_1 = require("../../src/angular/ngWalker");
var basicCssAstVisitor_1 = require("../../src/angular/styles/basicCssAstVisitor");
var chai = require("chai");
var spies = require("chai-spies");
chai.use(spies);
var chaiSpy = chai.spy;
describe('basicCssAstVisitor', function () {
    it('should use the default css walker by default', function () {
        var source = "\n      @Component({\n        styles: [\n          `foo`\n        ]\n      })\n      class Baz {}\n    ";
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
    it('should visit the css selector', function () {
        var source = "\n      @Component({\n        styles: [\n          `\n          .foo::before {}\n          .baz bar {}\n          `\n        ]\n      })\n      class Baz {}\n    ";
        var ruleArgs = {
            ruleName: 'foo',
            ruleArguments: ['foo'],
            disabledIntervals: null,
            ruleSeverity: 'warning'
        };
        var sf = ts.createSourceFile('foo', source, null);
        var walker = new ngWalker_1.NgWalker(sf, ruleArgs);
        chai.expect(function () {
            var selectorSpy = chaiSpy.on(basicCssAstVisitor_1.BasicCssAstVisitor.prototype, 'visitCssSelector');
            var pseudoSelectorSpy = chaiSpy.on(basicCssAstVisitor_1.BasicCssAstVisitor.prototype, 'visitCssPseudoSelector');
            walker.walk(sf);
            chai.expect(selectorSpy).to.have.been.called();
            chai.expect(pseudoSelectorSpy).to.have.been.called();
        }).not.to.throw();
    });
});
