"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var ngWalker_1 = require("../../src/angular/ngWalker");
var classDeclarationUtils_1 = require("../../src/util/classDeclarationUtils");
var chai = require("chai");
describe('ngWalker', function () {
    it('should visit components and directives', function () {
        var source = "\n      class Foobar {\n        foo: number;\n        bar() {}\n        baz() {}\n      }\n    ";
        var ruleArgs = {
            ruleName: 'foo',
            ruleArguments: ['foo'],
            disabledIntervals: null,
            ruleSeverity: 'warning'
        };
        var properties = {};
        var methods = {};
        var ClassUtilWalker = (function (_super) {
            __extends(ClassUtilWalker, _super);
            function ClassUtilWalker() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ClassUtilWalker.prototype.visitClassDeclaration = function (node) {
                properties = classDeclarationUtils_1.getDeclaredPropertyNames(node);
                methods = classDeclarationUtils_1.getDeclaredMethodNames(node);
            };
            return ClassUtilWalker;
        }(ngWalker_1.NgWalker));
        var sf = ts.createSourceFile('foo', source, null);
        var walker = new ClassUtilWalker(sf, ruleArgs);
        walker.walk(sf);
        chai.expect(methods).to.deep.eq({ bar: true, baz: true });
        chai.expect(properties).to.deep.eq({ foo: true });
    });
});
