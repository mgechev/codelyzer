"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var chai = require("chai");
var dummyFileResolver_1 = require("../../src/angular/fileResolver/dummyFileResolver");
var fsFileResolver_1 = require("../../src/angular/fileResolver/fsFileResolver");
var metadataReader_1 = require("../../src/angular/metadataReader");
var metadata_1 = require("../../src/angular/metadata");
var config_1 = require("../../src/angular/config");
var path_1 = require("path");
var getAst = function (code, file) {
    if (file === void 0) { file = 'file.ts'; }
    return ts.createSourceFile(file, code, ts.ScriptTarget.ES2015, true);
};
describe('metadataReader', function () {
    describe('directive metadata', function () {
        it('should read selector', function () {
            var code = "\n      @Directive({\n        selector: 'foo'\n      })\n      class Bar {}\n      ";
            var reader = new metadataReader_1.MetadataReader(new dummyFileResolver_1.DummyFileResolver());
            var ast = getAst(code);
            var metadata = reader.read(ast.statements.pop());
            chai.expect(metadata.selector).eq('foo');
        });
        it('should not fail with empty decorator', function () {
            var code = "\n      @Directive()\n      class Bar {}\n      ";
            var reader = new metadataReader_1.MetadataReader(new dummyFileResolver_1.DummyFileResolver());
            var ast = getAst(code);
            var metadata = reader.read(ast.statements.pop());
            chai.expect(metadata.selector).eq(undefined);
        });
        it('should provide class declaration', function () {
            var code = "\n      @Directive()\n      class Bar {}\n      ";
            var reader = new metadataReader_1.MetadataReader(new dummyFileResolver_1.DummyFileResolver());
            var ast = getAst(code);
            var classDeclaration = ast.statements.pop();
            var metadata = reader.read(classDeclaration);
            chai.expect(metadata.controller).eq(classDeclaration);
        });
    });
    describe('component', function () {
        it('should work with inline data', function () {
            var code = "\n      @Component({\n        selector: 'foo',\n        template: 'bar',\n        styles: [`baz`]\n      })\n      class Bar {}\n      ";
            var reader = new metadataReader_1.MetadataReader(new dummyFileResolver_1.DummyFileResolver());
            var ast = getAst(code);
            var classDeclaration = ast.statements.pop();
            var metadata = reader.read(classDeclaration);
            chai.expect(metadata instanceof metadata_1.ComponentMetadata).eq(true);
            chai.expect(metadata.selector).eq('foo');
            var m = metadata;
            chai.expect(m.template.template.code).eq('bar');
            chai.expect(m.template.url).eq(null);
            chai.expect(m.styles[0].style.code).eq('baz');
            chai.expect(m.styles[0].url).eq(null);
        });
        it('should work with external template', function () {
            var code = "\n      @Component({\n        selector: 'foo',\n        templateUrl: 'bar',\n        styles: [`baz`]\n      })\n      class Bar {}\n      ";
            var reader = new metadataReader_1.MetadataReader(new dummyFileResolver_1.DummyFileResolver());
            var ast = getAst(code);
            var classDeclaration = ast.statements.pop();
            var metadata = reader.read(classDeclaration);
            chai.expect(metadata instanceof metadata_1.ComponentMetadata).eq(true);
            chai.expect(metadata.selector).eq('foo');
            var m = metadata;
            chai.expect(m.template.template.code).eq('');
            chai.expect(m.template.url).eq('bar');
            chai.expect(m.styles[0].style.code).eq('baz');
            chai.expect(m.styles[0].url).eq(null);
        });
        it('should work with ignore templateUrl when has template', function () {
            var code = "\n      @Component({\n        selector: 'foo',\n        templateUrl: 'bar',\n        template: 'qux',\n        styles: [`baz`]\n      })\n      class Bar {}\n      ";
            var reader = new metadataReader_1.MetadataReader(new dummyFileResolver_1.DummyFileResolver());
            var ast = getAst(code);
            var classDeclaration = ast.statements.pop();
            var metadata = reader.read(classDeclaration);
            chai.expect(metadata instanceof metadata_1.ComponentMetadata).eq(true);
            chai.expect(metadata.selector).eq('foo');
            var m = metadata;
            chai.expect(m.template.template.code).eq('qux');
            chai.expect(m.template.url).eq(null);
            chai.expect(m.styles[0].style.code).eq('baz');
            chai.expect(m.styles[0].url).eq(null);
        });
        it('should work with relative paths', function () {
            var code = "\n      @Component({\n        selector: 'foo',\n        templateUrl: 'foo.html',\n        styles: [`baz`]\n      })\n      class Bar {}\n      ";
            var reader = new metadataReader_1.MetadataReader(new fsFileResolver_1.FsFileResolver());
            var ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/moduleid/foo.ts');
            var classDeclaration = ast.statements.pop();
            var metadata = reader.read(classDeclaration);
            chai.expect(metadata instanceof metadata_1.ComponentMetadata).eq(true);
            chai.expect(metadata.selector).eq('foo');
            var m = metadata;
            chai.expect(m.template.template.code.trim()).eq('<div></div>');
            chai.expect(m.template.url.endsWith('foo.html')).eq(true);
            chai.expect(m.styles[0].style.code).eq('baz');
            chai.expect(m.styles[0].url).eq(null);
        });
        it('should work with absolute paths', function () {
            var code = "\n      @Component({\n        selector: 'foo',\n        templateUrl: '/foo.html',\n        styles: [`baz`]\n      })\n      class Bar {}\n      ";
            var reader = new metadataReader_1.MetadataReader(new fsFileResolver_1.FsFileResolver());
            var ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/moduleid/foo.ts');
            var classDeclaration = ast.statements.pop();
            var metadata = reader.read(classDeclaration);
            chai.expect(metadata instanceof metadata_1.ComponentMetadata).eq(true);
            chai.expect(metadata.selector).eq('foo');
            var m = metadata;
            chai.expect(m.template.template.code.trim()).eq('<div></div>');
            chai.expect(m.template.url.endsWith('foo.html')).eq(true);
            chai.expect(m.styles[0].style.code).eq('baz');
            chai.expect(m.styles[0].url).eq(null);
        });
        it('should work invoke Config.resolveUrl after all resolves', function () {
            var invoked = false;
            var bak = config_1.Config.resolveUrl;
            try {
                config_1.Config.resolveUrl = function (url) {
                    invoked = true;
                    chai.expect(url.startsWith(path_1.normalize(path_1.join(__dirname, '../..')))).eq(true);
                    return url;
                };
                var code = "\n      @Component({\n        selector: 'foo',\n        moduleId: module.id,\n        templateUrl: 'foo.html',\n        styles: [`baz`]\n      })\n      class Bar {}\n      ";
                var reader = new metadataReader_1.MetadataReader(new fsFileResolver_1.FsFileResolver());
                var ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/moduleid/foo.ts');
                var classDeclaration = ast.statements.pop();
                chai.expect(invoked).eq(false);
                var metadata = reader.read(classDeclaration);
                chai.expect(metadata instanceof metadata_1.ComponentMetadata).eq(true);
                chai.expect(metadata.selector).eq('foo');
                var m = metadata;
                chai.expect(m.template.template.code.trim()).eq('<div></div>');
                chai.expect(m.template.url.endsWith('foo.html')).eq(true);
                chai.expect(m.styles[0].style.code).eq('baz');
                chai.expect(m.styles[0].url).eq(null);
                chai.expect(invoked).eq(true);
            }
            finally {
                config_1.Config.resolveUrl = bak;
            }
        });
        it('should work invoke Config.transformTemplate', function () {
            var invoked = false;
            var bak = config_1.Config.transformTemplate;
            try {
                config_1.Config.transformTemplate = function (code) {
                    invoked = true;
                    chai.expect(code.trim()).eq('<div></div>');
                    return { code: code };
                };
                var code = "\n      @Component({\n        selector: 'foo',\n        moduleId: module.id,\n        templateUrl: 'foo.html',\n        styles: [`baz`]\n      })\n      class Bar {}\n      ";
                var reader = new metadataReader_1.MetadataReader(new fsFileResolver_1.FsFileResolver());
                var ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/moduleid/foo.ts');
                var classDeclaration = ast.statements.pop();
                chai.expect(invoked).eq(false);
                var metadata = reader.read(classDeclaration);
                chai.expect(metadata instanceof metadata_1.ComponentMetadata).eq(true);
                chai.expect(metadata.selector).eq('foo');
                var m = metadata;
                chai.expect(m.template.template.code.trim()).eq('<div></div>');
                chai.expect(m.template.url.endsWith('foo.html')).eq(true);
                chai.expect(m.styles[0].style.code).eq('baz');
                chai.expect(m.styles[0].url).eq(null);
                chai.expect(invoked).eq(true);
            }
            finally {
                config_1.Config.transformTemplate = bak;
            }
        });
        it('should work invoke Config.transformStyle', function () {
            var invoked = false;
            var bak = config_1.Config.transformStyle;
            try {
                config_1.Config.transformStyle = function (code) {
                    invoked = true;
                    chai.expect(code).eq('baz');
                    return { code: code };
                };
                var code = "\n      @Component({\n        selector: 'foo',\n        moduleId: module.id,\n        templateUrl: 'foo.html',\n        styles: [`baz`]\n      })\n      class Bar {}\n      ";
                var reader = new metadataReader_1.MetadataReader(new fsFileResolver_1.FsFileResolver());
                var ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/moduleid/foo.ts');
                var classDeclaration = ast.statements.pop();
                chai.expect(invoked).eq(false);
                var metadata = reader.read(classDeclaration);
                chai.expect(metadata instanceof metadata_1.ComponentMetadata).eq(true);
                chai.expect(metadata.selector).eq('foo');
                var m = metadata;
                chai.expect(m.template.template.code.trim()).eq('<div></div>');
                chai.expect(m.template.url.endsWith('foo.html')).eq(true);
                chai.expect(m.styles[0].style.code).eq('baz');
                chai.expect(m.styles[0].url).eq(null);
                chai.expect(invoked).eq(true);
            }
            finally {
                config_1.Config.transformStyle = bak;
            }
        });
        it('should work work with templates with "`"', function () {
            var code = "\n      @Component({\n        selector: 'foo',\n        moduleId: module.id,\n        templateUrl: 'foo.html',\n        styles: [`baz`]\n      })\n      class Bar {}\n      ";
            var reader = new metadataReader_1.MetadataReader(new fsFileResolver_1.FsFileResolver());
            var ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/specialsymbols/foo.ts');
            var classDeclaration = ast.statements.pop();
            var metadata = reader.read(classDeclaration);
            chai.expect(metadata instanceof metadata_1.ComponentMetadata).eq(true);
            chai.expect(metadata.selector).eq('foo');
            var m = metadata;
            chai.expect(m.template.template.code.trim()).eq('<div>`</div>');
            chai.expect(m.template.url.endsWith('foo.html')).eq(true);
            chai.expect(m.styles[0].style.code).eq('baz');
            chai.expect(m.styles[0].url).eq(null);
        });
        it('should work work with templates with "`"', function () {
            var code = "\n      @Component({\n        selector: 'foo',\n        moduleId: module.id,\n        templateUrl: 'foo.dust',\n        styleUrls: ['foo.sty']\n      })\n      class Bar {}\n      ";
            var reader = new metadataReader_1.MetadataReader(new fsFileResolver_1.FsFileResolver());
            var ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/notsupported/foo.ts');
            var classDeclaration = ast.statements.pop();
            var metadata = reader.read(classDeclaration);
            chai.expect(metadata instanceof metadata_1.ComponentMetadata).eq(true);
            chai.expect(metadata.selector).eq('foo');
            var m = metadata;
            chai.expect(m.template.template.code.trim()).eq('');
            chai.expect(m.template.url.endsWith('foo.dust')).eq(true);
            chai.expect(m.styles[0].style.code).eq('');
            chai.expect(m.styles[0].url.endsWith('foo.sty')).eq(true);
        });
    });
});
