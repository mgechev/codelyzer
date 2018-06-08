import { expect } from 'chai';
import * as ts from 'typescript';

import { AbstractResolver } from '../../../src/angular/urlResolvers/abstractResolver';

const getAst = (code: string) => {
  return ts.createSourceFile('file.ts', code, ts.ScriptTarget.ES5, true);
};

class DummyResolver extends AbstractResolver {
  resolve(d: ts.Decorator) {
    return null;
  }

  getTemplate(d: ts.Decorator) {
    return this.getTemplateUrl(d);
  }

  getStyles(d: ts.Decorator) {
    return this.getStyleUrls(d);
  }
}

const last = <T extends ts.Node>(nodes: ts.NodeArray<T>) => nodes[nodes.length - 1];

describe('urlResolver', () => {
  describe('templateUrl', () => {
    it('should be able to resolve templateUrls', () => {
      const source = `
        @Component({
          templateUrl: './foo/bar'
        })
        class Foo {}
      `;
      const ast = getAst(source);
      const resolver = new DummyResolver();
      const template = resolver.getTemplate(last(ast.statements).decorators![0]);
      expect(template).eq('./foo/bar');
    });

    it('should be able to resolve templateUrls set with template string', () => {
      const source = `
        @Component({
          templateUrl: \`./foo/bar\`
        })
        class Foo {}
      `;
      const ast = getAst(source);
      const resolver = new DummyResolver();
      const template = resolver.getTemplate(last(ast.statements).decorators![0]);
      expect(template).eq('./foo/bar');
    });

    it('should not be able to resolve templateUrls set with complex template string', () => {
      const source = `
        @Component({
          templateUrl: \`\${foo}./foo/bar\`
        })
        class Foo {}
      `;
      const ast = getAst(source);
      const resolver = new DummyResolver();
      const template = resolver.getTemplate(last(ast.statements).decorators![0]);
      expect(template).eq(undefined);
    });

    it('should not be able to resolve missing templateUrl', () => {
      const source = `
        @Component({
          template: 'bar'
        })
        class Foo {}
      `;
      const ast = getAst(source);
      const resolver = new DummyResolver();
      const template = resolver.getTemplate(last(ast.statements).decorators![0]);
      expect(template).eq(undefined);
    });

    it('should not be able to resolve templateUrls when having missing object literal', () => {
      const source = `
        @Component()
        class Foo {}
      `;
      const ast = getAst(source);
      const resolver = new DummyResolver();
      const template = resolver.getTemplate(last(ast.statements).decorators![0]);
      expect(template).eq(undefined);
    });

    it('should not be able to resolve templateUrls when having missing object literal', () => {
      const source = `
        @Component
        class Foo {}
      `;
      const ast = getAst(source);
      const resolver = new DummyResolver();
      const template = resolver.getTemplate(last(ast.statements).decorators![0]);
      expect(template).eq(undefined);
    });
  });

  describe('styleUrls', () => {
    it('should not be able to resolve styleUrls when having missing object literal', () => {
      const source = `
        @Component
        class Foo {}
      `;
      const ast = getAst(source);
      const resolver = new DummyResolver();
      const styles = resolver.getStyles(last(ast.statements).decorators![0]);
      expect(styles).to.deep.equal([]);
    });

    it('should not be able to resolve styleUrls when having missing object literal', () => {
      const source = `
        @Component()
        class Foo {}
      `;
      const ast = getAst(source);
      const resolver = new DummyResolver();
      const styles = resolver.getStyles(last(ast.statements).decorators![0]);
      expect(styles).to.deep.equal([]);
    });

    it('should be able to resolve styleUrls with string literal', () => {
      const source = `
        @Component({
          styleUrls: [
            './foo',
            './bar'
          ]
        })
        class Foo {}
      `;
      const ast = getAst(source);
      const resolver = new DummyResolver();
      const styles = resolver.getStyles(last(ast.statements).decorators![0]);
      expect(styles).to.deep.equal(['./foo', './bar']);
    });

    it('should be able to resolve styleUrls with string literal', () => {
      const source = `
        @Component({
          styleUrls: [
            \`./foo\`,
            './bar'
          ]
        })
        class Foo {}
      `;
      const ast = getAst(source);
      const resolver = new DummyResolver();
      const styles = resolver.getStyles(last(ast.statements).decorators![0]);
      expect(styles).to.deep.equal(['./foo', './bar']);
    });

    it('should ignore non-string literal urls', () => {
      const source = `
        @Component({
          styleUrls: [
            \`./foo\`,
            \`\${foo}\`,
            './bar',
            baz
          ]
        })
        class Foo {}
      `;
      const ast = getAst(source);
      const resolver = new DummyResolver();
      const styles = resolver.getStyles(last(ast.statements).decorators![0]);
      expect(styles).to.deep.equal(['./foo', './bar']);
    });
  });
});
