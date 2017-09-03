import * as ts from 'typescript';
import chai = require('chai');

import { DummyFileResolver } from '../../src/angular/fileResolver/dummyFileResolver';
import { FsFileResolver } from '../../src/angular/fileResolver/fsFileResolver';
import { MetadataReader } from '../../src/angular/metadataReader';
import { ComponentMetadata } from '../../src/angular/metadata';
import { Config } from '../../src/angular/config';

import { join, normalize } from 'path';

const getAst = (code: string, file = 'file.ts') => {
  return ts.createSourceFile(file, code, ts.ScriptTarget.ES2015, true);
};

describe('metadataReader', () => {

  describe('directive metadata', () => {

    it('should read selector', () => {
      const code = `
      @Directive({
        selector: 'foo'
      })
      class Bar {}
      `;
      const reader = new MetadataReader(new DummyFileResolver());
      const ast = getAst(code);
      const metadata = reader.read((<ts.ClassDeclaration>ast.statements.pop()));
      chai.expect(metadata.selector).eq('foo');
    });

    it('should not fail with empty decorator', () => {
      const code = `
      @Directive()
      class Bar {}
      `;
      const reader = new MetadataReader(new DummyFileResolver());
      const ast = getAst(code);
      const metadata = reader.read((<ts.ClassDeclaration>ast.statements.pop()));
      chai.expect(metadata.selector).eq(undefined);
    });

    it('should provide class declaration', () => {
      const code = `
      @Directive()
      class Bar {}
      `;
      const reader = new MetadataReader(new DummyFileResolver());
      const ast = getAst(code);
      const classDeclaration = <ts.ClassDeclaration>ast.statements.pop();
      const metadata = reader.read(classDeclaration);
      chai.expect(metadata.controller).eq(classDeclaration);
    });
  });

  describe('component', () => {

    it('should work with inline data', () => {
      const code = `
      @Component({
        selector: 'foo',
        template: 'bar',
        styles: [\`baz\`]
      })
      class Bar {}
      `;
      const reader = new MetadataReader(new DummyFileResolver());
      const ast = getAst(code);
      const classDeclaration = <ts.ClassDeclaration>ast.statements.pop();
      const metadata = reader.read(classDeclaration);
      chai.expect(metadata instanceof ComponentMetadata).eq(true);
      chai.expect(metadata.selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      chai.expect(m.template.template.code).eq('bar');
      chai.expect(m.template.url).eq(null);
      chai.expect(m.styles[0].style.code).eq('baz');
      chai.expect(m.styles[0].url).eq(null);
    });

    it('should work with external template', () => {
      const code = `
      @Component({
        selector: 'foo',
        templateUrl: 'bar',
        styles: [\`baz\`]
      })
      class Bar {}
      `;
      const reader = new MetadataReader(new DummyFileResolver());
      const ast = getAst(code);
      const classDeclaration = <ts.ClassDeclaration>ast.statements.pop();
      const metadata = reader.read(classDeclaration);
      chai.expect(metadata instanceof ComponentMetadata).eq(true);
      chai.expect(metadata.selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      chai.expect(m.template.template.code).eq('');
      chai.expect(m.template.url).eq('bar');
      chai.expect(m.styles[0].style.code).eq('baz');
      chai.expect(m.styles[0].url).eq(null);
    });

    it('should work with ignore templateUrl when has template', () => {
      const code = `
      @Component({
        selector: 'foo',
        templateUrl: 'bar',
        template: 'qux',
        styles: [\`baz\`]
      })
      class Bar {}
      `;
      const reader = new MetadataReader(new DummyFileResolver());
      const ast = getAst(code);
      const classDeclaration = <ts.ClassDeclaration>ast.statements.pop();
      const metadata = reader.read(classDeclaration);
      chai.expect(metadata instanceof ComponentMetadata).eq(true);
      chai.expect(metadata.selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      chai.expect(m.template.template.code).eq('qux');
      chai.expect(m.template.url).eq(null);
      chai.expect(m.styles[0].style.code).eq('baz');
      chai.expect(m.styles[0].url).eq(null);
    });


    it('should work with relative paths', () => {
      const code = `
      @Component({
        selector: 'foo',
        templateUrl: 'foo.html',
        styles: [\`baz\`]
      })
      class Bar {}
      `;
      const reader = new MetadataReader(new FsFileResolver());
      const ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/moduleid/foo.ts');
      const classDeclaration = <ts.ClassDeclaration>ast.statements.pop();
      const metadata = reader.read(classDeclaration);
      chai.expect(metadata instanceof ComponentMetadata).eq(true);
      chai.expect(metadata.selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      chai.expect(m.template.template.code.trim()).eq('<div></div>');
      chai.expect(m.template.url.endsWith('foo.html')).eq(true);
      chai.expect(m.styles[0].style.code).eq('baz');
      chai.expect(m.styles[0].url).eq(null);
    });

    it('should work with absolute paths', () => {
      const code = `
      @Component({
        selector: 'foo',
        templateUrl: '/foo.html',
        styles: [\`baz\`]
      })
      class Bar {}
      `;
      const reader = new MetadataReader(new FsFileResolver());
      const ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/moduleid/foo.ts');
      const classDeclaration = <ts.ClassDeclaration>ast.statements.pop();
      const metadata = reader.read(classDeclaration);
      chai.expect(metadata instanceof ComponentMetadata).eq(true);
      chai.expect(metadata.selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      chai.expect(m.template.template.code.trim()).eq('<div></div>');
      chai.expect(m.template.url.endsWith('foo.html')).eq(true);
      chai.expect(m.styles[0].style.code).eq('baz');
      chai.expect(m.styles[0].url).eq(null);
    });

    it('should work invoke Config.resolveUrl after all resolves', () => {
      let invoked = false;
      const bak = Config.resolveUrl;
      try {

          Config.resolveUrl = (url: string) => {
              invoked = true;
              chai.expect(url.startsWith(normalize(join(__dirname, '../..')))).eq(true);
              return url;
          };
          const code = `
      @Component({
        selector: 'foo',
        moduleId: module.id,
        templateUrl: 'foo.html',
        styles: [\`baz\`]
      })
      class Bar {}
      `;
          const reader = new MetadataReader(new FsFileResolver());
          const ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/moduleid/foo.ts');
          const classDeclaration = <ts.ClassDeclaration>ast.statements.pop();
          chai.expect(invoked).eq(false);
          const metadata = reader.read(classDeclaration);
          chai.expect(metadata instanceof ComponentMetadata).eq(true);
          chai.expect(metadata.selector).eq('foo');
          const m = <ComponentMetadata>metadata;
          chai.expect(m.template.template.code.trim()).eq('<div></div>');
          chai.expect(m.template.url.endsWith('foo.html')).eq(true);
          chai.expect(m.styles[0].style.code).eq('baz');
          chai.expect(m.styles[0].url).eq(null);
          chai.expect(invoked).eq(true);
      } finally {
          Config.resolveUrl = bak;
      }
    });

    it('should work invoke Config.transformTemplate', () => {
      let invoked = false;
      const bak = Config.transformTemplate;
      try {

      Config.transformTemplate = (code: string) => {
        invoked = true;
        chai.expect(code.trim()).eq('<div></div>');
        return { code };
      };
      const code = `
      @Component({
        selector: 'foo',
        moduleId: module.id,
        templateUrl: 'foo.html',
        styles: [\`baz\`]
      })
      class Bar {}
      `;
      const reader = new MetadataReader(new FsFileResolver());
      const ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/moduleid/foo.ts');
      const classDeclaration = <ts.ClassDeclaration>ast.statements.pop();
      chai.expect(invoked).eq(false);
      const metadata = reader.read(classDeclaration);
      chai.expect(metadata instanceof ComponentMetadata).eq(true);
      chai.expect(metadata.selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      chai.expect(m.template.template.code.trim()).eq('<div></div>');
      chai.expect(m.template.url.endsWith('foo.html')).eq(true);
      chai.expect(m.styles[0].style.code).eq('baz');
      chai.expect(m.styles[0].url).eq(null);
      chai.expect(invoked).eq(true);

      } finally {
          Config.transformTemplate = bak;
      }
    });

    it('should work invoke Config.transformStyle', () => {
      let invoked = false;
      const bak = Config.transformStyle;
      try {
          Config.transformStyle = (code: string) => {
              invoked = true;
              chai.expect(code).eq('baz');
              return {code};
          };
          const code = `
      @Component({
        selector: 'foo',
        moduleId: module.id,
        templateUrl: 'foo.html',
        styles: [\`baz\`]
      })
      class Bar {}
      `;
          const reader = new MetadataReader(new FsFileResolver());
          const ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/moduleid/foo.ts');
          const classDeclaration = <ts.ClassDeclaration>ast.statements.pop();
          chai.expect(invoked).eq(false);
          const metadata = reader.read(classDeclaration);
          chai.expect(metadata instanceof ComponentMetadata).eq(true);
          chai.expect(metadata.selector).eq('foo');
          const m = <ComponentMetadata>metadata;
          chai.expect(m.template.template.code.trim()).eq('<div></div>');
          chai.expect(m.template.url.endsWith('foo.html')).eq(true);
          chai.expect(m.styles[0].style.code).eq('baz');
          chai.expect(m.styles[0].url).eq(null);
          chai.expect(invoked).eq(true);
      } finally {
          Config.transformStyle = bak;
      }
    });

    it('should work work with templates with "`"', () => {
      const code = `
      @Component({
        selector: 'foo',
        moduleId: module.id,
        templateUrl: 'foo.html',
        styles: [\`baz\`]
      })
      class Bar {}
      `;
      const reader = new MetadataReader(new FsFileResolver());
      const ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/specialsymbols/foo.ts');
      const classDeclaration = <ts.ClassDeclaration>ast.statements.pop();
      const metadata = reader.read(classDeclaration);
      chai.expect(metadata instanceof ComponentMetadata).eq(true);
      chai.expect(metadata.selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      chai.expect(m.template.template.code.trim()).eq('<div>`</div>');
      chai.expect(m.template.url.endsWith('foo.html')).eq(true);
      chai.expect(m.styles[0].style.code).eq('baz');
      chai.expect(m.styles[0].url).eq(null);
    });

    it('should work work with templates with "`"', () => {
      const code = `
      @Component({
        selector: 'foo',
        moduleId: module.id,
        templateUrl: 'foo.dust',
        styleUrls: ['foo.sty']
      })
      class Bar {}
      `;
      const reader = new MetadataReader(new FsFileResolver());
      const ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/notsupported/foo.ts');
      const classDeclaration = <ts.ClassDeclaration>ast.statements.pop();
      const metadata = reader.read(classDeclaration);
      chai.expect(metadata instanceof ComponentMetadata).eq(true);
      chai.expect(metadata.selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      chai.expect(m.template.template.code.trim()).eq('');
      chai.expect(m.template.url.endsWith('foo.dust')).eq(true);
      chai.expect(m.styles[0].style.code).eq('');
      chai.expect(m.styles[0].url.endsWith('foo.sty')).eq(true);
    });
  });
});

