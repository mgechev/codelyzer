"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var templateParser_1 = require("../../src/angular/templates/templateParser");
var referenceCollectorVisitor_1 = require("../../src/angular/templates/referenceCollectorVisitor");
var compiler_1 = require("@angular/compiler");
var chai_1 = require("chai");
describe('ReferenceCollectorVisitor', function () {
    it('should work with empty templates', function () {
        var template = templateParser_1.parseTemplate('');
        var rv = new referenceCollectorVisitor_1.ReferenceCollectorVisitor();
        compiler_1.templateVisitAll(rv, template, null);
        chai_1.expect(Object.keys(rv.variables).length).eq(0);
    });
    it('should work with simple templates', function () {
        var template = templateParser_1.parseTemplate('<div></div>');
        var rv = new referenceCollectorVisitor_1.ReferenceCollectorVisitor();
        compiler_1.templateVisitAll(rv, template, null);
        chai_1.expect(Object.keys(rv.variables).length).eq(0);
    });
    it('should work with templates with one reference', function () {
        var template = templateParser_1.parseTemplate('<div #foo></div>');
        var rv = new referenceCollectorVisitor_1.ReferenceCollectorVisitor();
        compiler_1.templateVisitAll(rv, template, null);
        chai_1.expect(Object.keys(rv.variables).length).eq(1);
        chai_1.expect(rv.variables['foo']).to.eq(true);
    });
    it('should work with templates with nested elements with references', function () {
        var template = templateParser_1.parseTemplate('<div #foo><span #bar></span></div>');
        var rv = new referenceCollectorVisitor_1.ReferenceCollectorVisitor();
        compiler_1.templateVisitAll(rv, template, null);
        chai_1.expect(Object.keys(rv.variables).length).eq(2);
        chai_1.expect(rv.variables['bar']).to.eq(true);
        chai_1.expect(rv.variables['foo']).to.eq(true);
    });
    it('should work with templates with multiple elements with different references', function () {
        var template = templateParser_1.parseTemplate('<div #foo><span #bar></span></div><span #qux></span>');
        var rv = new referenceCollectorVisitor_1.ReferenceCollectorVisitor();
        compiler_1.templateVisitAll(rv, template, null);
        chai_1.expect(Object.keys(rv.variables).length).eq(3);
        chai_1.expect(rv.variables['foo']).eq(true);
        chai_1.expect(rv.variables['bar']).eq(true);
        chai_1.expect(rv.variables['qux']).eq(true);
    });
});
