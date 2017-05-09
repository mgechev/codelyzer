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
var chai = require("chai");
var abstractResolver_1 = require("../../../src/angular/urlResolvers/abstractResolver");
var getAst = function (code) {
    return ts.createSourceFile('file.ts', code, ts.ScriptTarget.ES2015, true);
};
var DummyResolver = (function (_super) {
    __extends(DummyResolver, _super);
    function DummyResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DummyResolver.prototype.resolve = function (d) {
        return null;
    };
    DummyResolver.prototype.getTemplate = function (d) {
        return this.getTemplateUrl(d);
    };
    DummyResolver.prototype.getStyles = function (d) {
        return this.getStyleUrls(d);
    };
    return DummyResolver;
}(abstractResolver_1.AbstractResolver));
describe('urlResolver', function () {
    describe('templateUrl', function () {
        it('should be able to resolve templateUrls', function () {
            var source = "\n      @Component({\n        templateUrl: './foo/bar'\n      })\n      class Foo {}\n      ";
            var ast = getAst(source);
            var resolver = new DummyResolver();
            var template = resolver.getTemplate(ast.statements.pop().decorators[0]);
            chai.expect(template).eq('./foo/bar');
        });
        it('should be able to resolve templateUrls set with template string', function () {
            var source = "\n      @Component({\n        templateUrl: `./foo/bar`\n      })\n      class Foo {}\n      ";
            var ast = getAst(source);
            var resolver = new DummyResolver();
            var template = resolver.getTemplate(ast.statements.pop().decorators[0]);
            chai.expect(template).eq('./foo/bar');
        });
        it('should not be able to resolve templateUrls set with complex template string', function () {
            var source = "\n      @Component({\n        templateUrl: `${foo}./foo/bar`\n      })\n      class Foo {}\n      ";
            var ast = getAst(source);
            var resolver = new DummyResolver();
            var template = resolver.getTemplate(ast.statements.pop().decorators[0]);
            chai.expect(template).eq(null);
        });
        it('should not be able to resolve missing templateUrl', function () {
            var source = "\n      @Component({\n        template: 'bar'\n      })\n      class Foo {}\n      ";
            var ast = getAst(source);
            var resolver = new DummyResolver();
            var template = resolver.getTemplate(ast.statements.pop().decorators[0]);
            chai.expect(template).eq(null);
        });
        it('should not be able to resolve templateUrls when having missing object literal', function () {
            var source = "\n      @Component()\n      class Foo {}\n      ";
            var ast = getAst(source);
            var resolver = new DummyResolver();
            var template = resolver.getTemplate(ast.statements.pop().decorators[0]);
            chai.expect(template).eq(null);
        });
        it('should not be able to resolve templateUrls when having missing object literal', function () {
            var source = "\n      @Component\n      class Foo {}\n      ";
            var ast = getAst(source);
            var resolver = new DummyResolver();
            var template = resolver.getTemplate(ast.statements.pop().decorators[0]);
            chai.expect(template).eq(null);
        });
    });
    describe('styleUrls', function () {
        it('should not be able to resolve styleUrls when having missing object literal', function () {
            var source = "\n      @Component\n      class Foo {}\n      ";
            var ast = getAst(source);
            var resolver = new DummyResolver();
            var styles = resolver.getStyles(ast.statements.pop().decorators[0]);
            chai.expect(styles).to.deep.equal([]);
        });
        it('should not be able to resolve styleUrls when having missing object literal', function () {
            var source = "\n      @Component()\n      class Foo {}\n      ";
            var ast = getAst(source);
            var resolver = new DummyResolver();
            var styles = resolver.getStyles(ast.statements.pop().decorators[0]);
            chai.expect(styles).to.deep.equal([]);
        });
        it('should be able to resolve styleUrls with string literal', function () {
            var source = "\n      @Component({\n        styleUrls: [\n          './foo',\n          './bar'\n        ]\n      })\n      class Foo {}\n      ";
            var ast = getAst(source);
            var resolver = new DummyResolver();
            var styles = resolver.getStyles(ast.statements.pop().decorators[0]);
            chai.expect(styles).to.deep.equal(['./foo', './bar']);
        });
        it('should be able to resolve styleUrls with string literal', function () {
            var source = "\n      @Component({\n        styleUrls: [\n          `./foo`,\n          './bar'\n        ]\n      })\n      class Foo {}\n      ";
            var ast = getAst(source);
            var resolver = new DummyResolver();
            var styles = resolver.getStyles(ast.statements.pop().decorators[0]);
            chai.expect(styles).to.deep.equal(['./foo', './bar']);
        });
        it('should ignore non-string literal urls', function () {
            var source = "\n      @Component({\n        styleUrls: [\n          `./foo`,\n          `${foo}`,\n          './bar',\n          baz\n        ]\n      })\n      class Foo {}\n      ";
            var ast = getAst(source);
            var resolver = new DummyResolver();
            var styles = resolver.getStyles(ast.statements.pop().decorators[0]);
            chai.expect(styles).to.deep.equal(['./foo', './bar']);
        });
    });
});
