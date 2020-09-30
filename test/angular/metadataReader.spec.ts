import { expect } from 'chai';
import * as ts from 'typescript';

import { Config } from '../../src/angular/config';
import { DummyFileResolver } from '../../src/angular/fileResolver/dummyFileResolver';
import { FsFileResolver } from '../../src/angular/fileResolver/fsFileResolver';
import { ComponentMetadata, DirectiveMetadata, PipeMetadata } from '../../src/angular/metadata';
import { MetadataReader } from '../../src/angular/metadataReader';

import { join, normalize } from 'path';

const getAst = (code: string, file = 'file.ts') => ts.createSourceFile(file, code, ts.ScriptTarget.ES5, true);

const last = <T extends ts.Node>(nodes: ts.NodeArray<T>) => nodes[nodes.length - 1];

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
      const metadata = reader.read(last(ast.statements) as ts.ClassDeclaration)!;
      expect(metadata).instanceof(DirectiveMetadata);
      expect((metadata as DirectiveMetadata).selector).eq('foo');
    });

    it('should read name', () => {
      const code = `
        @Pipe({
          name: 'foo'
        })
        class Bar {}
      `;
      const reader = new MetadataReader(new DummyFileResolver());
      const ast = getAst(code);
      const metadata = reader.read(last(ast.statements) as ts.ClassDeclaration)!;
      expect(metadata).instanceof(PipeMetadata);
      expect((metadata as PipeMetadata).name).eq('foo');
    });

    it('should not fail with empty decorator', () => {
      const code = `
        @Directive()
        class Bar {}
      `;
      const reader = new MetadataReader(new DummyFileResolver());
      const ast = getAst(code);
      const metadata = reader.read(last(ast.statements) as ts.ClassDeclaration)!;
      expect(metadata).instanceof(DirectiveMetadata);
      expect((metadata as DirectiveMetadata).selector).eq(undefined);
    });

    it('should provide class declaration', () => {
      const code = `
        @Directive()
        class Bar {}
      `;
      const reader = new MetadataReader(new DummyFileResolver());
      const ast = getAst(code);
      const classDeclaration = <ts.ClassDeclaration>last(ast.statements);
      const metadata = reader.read(classDeclaration)!;
      expect(metadata).instanceof(DirectiveMetadata);
      expect(metadata.controller).eq(classDeclaration);
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
      const classDeclaration = <ts.ClassDeclaration>last(ast.statements);
      const metadata = reader.read(classDeclaration)!;
      expect(metadata).instanceof(ComponentMetadata);
      expect((metadata as ComponentMetadata).selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      expect(m.template!.template.code).eq('bar');
      expect(m.template!.url).eq(undefined);
      expect(m.styles![0]!.style.code).eq('baz');
      expect(m.styles![0]!.url).eq(undefined);
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
      const classDeclaration = <ts.ClassDeclaration>last(ast.statements);
      const metadata = reader.read(classDeclaration)!;
      expect(metadata).instanceof(ComponentMetadata);
      expect((metadata as ComponentMetadata).selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      expect(m.template!.template.code).eq('');
      expect(m.template!.url).eq('bar');
      expect(m.styles![0]!.style.code).eq('baz');
      expect(m.styles![0]!.url).eq(undefined);
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
      const classDeclaration = <ts.ClassDeclaration>last(ast.statements);
      const metadata = reader.read(classDeclaration)!;
      expect(metadata).instanceof(ComponentMetadata);
      expect((metadata as ComponentMetadata).selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      expect(m.template!.template.code).eq('qux');
      expect(m.template!.url).eq(undefined);
      expect(m.styles![0]!.style.code).eq('baz');
      expect(m.styles![0]!.url).eq(undefined);
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
      const classDeclaration = <ts.ClassDeclaration>last(ast.statements);
      const metadata = reader.read(classDeclaration)!;
      expect(metadata).instanceof(ComponentMetadata);
      expect((metadata as ComponentMetadata).selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      expect(m.template!.template.code.trim()).eq('<div></div>');
      expect(m.template!.url!.endsWith('foo.html')).eq(true);
      expect(m.styles![0]!.style.code).eq('baz');
      expect(m.styles![0]!.url).eq(undefined);
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
      const classDeclaration = <ts.ClassDeclaration>last(ast.statements);
      const metadata = reader.read(classDeclaration)!;
      expect(metadata).instanceof(ComponentMetadata);
      expect((metadata as ComponentMetadata).selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      expect(m.template!.template.code.trim()).eq('<div></div>');
      expect(m.template!.url!.endsWith('foo.html')).eq(true);
      expect(m.styles![0]!.style.code).eq('baz');
      expect(m.styles![0]!.url).eq(undefined);
    });

    it('should work invoke Config.resolveUrl after all resolves', () => {
      let invoked = false;
      const bak = Config.resolveUrl;
      try {
        Config.resolveUrl = (url) => {
          invoked = true;
          expect(url!.startsWith(normalize(join(__dirname, '../..')))).eq(true);
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
        const classDeclaration = <ts.ClassDeclaration>last(ast.statements);
        expect(invoked).eq(false);
        const metadata = reader.read(classDeclaration)!;
        expect(metadata).instanceof(ComponentMetadata);
        expect((metadata as ComponentMetadata).selector).eq('foo');
        const m = <ComponentMetadata>metadata;
        expect(m.template!.template.code.trim()).eq('<div></div>');
        expect(m.template!.url!.endsWith('foo.html')).eq(true);
        expect(m.styles![0]!.style.code).eq('baz');
        expect(m.styles![0]!.url).eq(undefined);
        expect(invoked).eq(true);
      } finally {
        Config.resolveUrl = bak;
      }
    });

    it('should work invoke Config.transformTemplate', () => {
      let invoked = false;
      const bak = Config.transformTemplate;
      try {
        Config.transformTemplate = (code) => {
          invoked = true;
          expect(code.trim()).eq('<div></div>');
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
        const classDeclaration = <ts.ClassDeclaration>last(ast.statements);
        expect(invoked).eq(false);
        const metadata = reader.read(classDeclaration)!;
        expect(metadata).instanceof(ComponentMetadata);
        expect((metadata as ComponentMetadata).selector).eq('foo');
        const m = <ComponentMetadata>metadata;
        expect(m.template!.template.code.trim()).eq('<div></div>');
        expect(m.template!.url!.endsWith('foo.html')).eq(true);
        expect(m.styles![0]!.style.code).eq('baz');
        expect(m.styles![0]!.url).eq(undefined);
        expect(invoked).eq(true);
      } finally {
        Config.transformTemplate = bak;
      }
    });

    it('should work invoke Config.transformStyle', () => {
      let invoked = false;
      const bak = Config.transformStyle;
      try {
        Config.transformStyle = (code) => {
          invoked = true;
          expect(code).eq('baz');
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
        const classDeclaration = <ts.ClassDeclaration>last(ast.statements);
        expect(invoked).eq(false);
        const metadata = reader.read(classDeclaration)!;
        expect(metadata).instanceof(ComponentMetadata);
        expect((metadata as ComponentMetadata).selector).eq('foo');
        const m = <ComponentMetadata>metadata;
        expect(m.template!.template.code.trim()).eq('<div></div>');
        expect(m.template!.url!.endsWith('foo.html')).eq(true);
        expect(m.styles![0]!.style.code).eq('baz');
        expect(m.styles![0]!.url).eq(undefined);
        expect(invoked).eq(true);
      } finally {
        Config.transformStyle = bak;
      }
    });

    it('should pass url to Config.transformStyle when using styleUrls', () => {
      let styleUrl = 'test.scss';
      let invoked = false;
      const bak = Config.transformStyle;

      try {
        Config.transformStyle = (code, url) => {
          invoked = true;
          expect(url).to.be.an('string');
          expect(url!.endsWith('.scss')).eq(true);
          return { code };
        };

        const code = `
          @Component({
            selector: 'foo',
            moduleId: module.id,
            templateUrl: 'foo.html',
            styleUrls: ['${styleUrl}']
          })
          class Bar {}
        `;

        const reader = new MetadataReader(new FsFileResolver());
        const ast = getAst(code, __dirname + '/../../test/fixtures/metadataReader/moduleid/foo.ts');
        const classDeclaration = <ts.ClassDeclaration>last(ast.statements);
        expect(invoked).eq(false);
        const metadata = reader.read(classDeclaration)!;
        expect(metadata).instanceof(ComponentMetadata);
        expect((metadata as ComponentMetadata).selector).eq('foo');
        const m = <ComponentMetadata>metadata;
        expect(m.template!.template.code.trim()).eq('<div></div>');
        expect(m.template!.url!.endsWith('foo.html')).eq(true);
        expect(m.styles![0]!.style.code).eq('');
        expect(m.styles![0]!.url).to.be.an('string');
        expect(invoked).eq(true);
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
      const classDeclaration = <ts.ClassDeclaration>last(ast.statements);
      const metadata = reader.read(classDeclaration)!;
      expect(metadata).instanceof(ComponentMetadata);
      expect((metadata as ComponentMetadata).selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      expect(m.template!.template.code.trim()).eq('<div>`</div>');
      expect(m.template!.url!.endsWith('foo.html')).eq(true);
      expect(m.styles![0]!.style.code).eq('baz');
      expect(m.styles![0]!.url).eq(undefined);
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
      const classDeclaration = <ts.ClassDeclaration>last(ast.statements);
      const metadata = reader.read(classDeclaration)!;
      expect(metadata).instanceof(ComponentMetadata);
      expect((metadata as ComponentMetadata).selector).eq('foo');
      const m = <ComponentMetadata>metadata;
      expect(m.template!.template.code.trim()).eq('');
      expect(m.template!.url!.endsWith('foo.dust')).eq(true);
      expect(m.styles![0]!.style.code).eq('');
      expect(m.styles![0]!.url!.endsWith('foo.sty')).eq(true);
    });
  });
});
