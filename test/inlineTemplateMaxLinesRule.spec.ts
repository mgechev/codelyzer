import * as ts from 'typescript';

import { assertFailure, assertSuccess } from './testHelper';

const getAst = (code: string, file = 'file.ts') => {
  return ts.createSourceFile(file, code, ts.ScriptTarget.ES5, true);
};

describe('inline-template-max-lines', () => {
  describe('component has inline template', () => {
    it('should succeed when lines limit not exceeded', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>just one line template</div>\`
        })
        class Test {}`;

      assertSuccess('inline-template-max-lines', source);
    });

    it('should fail when lines limit exceeded default 3 lines limit', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>first line</div>
                      <div>second line</div>
                      <div>third line</div>
                      <div>fourth line</div>\`
        })
        class Test {}`;

      assertFailure('inline-template-max-lines', source, {
        message: 'Defined inline template lines count limit: 3 exceeded.',
        startPosition: {character: 20, line: 3},
        endPosition: {character: 45, line: 6},
      });
    });

    it('should fail when lines limit exceeded custom defined limit', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>first line</div>\`
        })
        class Test {}`;

      assertFailure('inline-template-max-lines', source, {
        message: 'Defined inline template lines count limit: 0 exceeded.',
        startPosition: {character: 20, line: 3},
        endPosition: {character: 43, line: 3},
      }, [0]);
    });

    it('should use default limit if incorrect has been passed', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>first line</div>\`
        })
        class Test {}`;

      assertSuccess('inline-template-max-lines', source, [-5]);
    });
  });

  describe('component hasn`t inline template', () => {
    it('should not report any failure', () => {
      let source = `
        @Component({
          selector: 'foobar',
        })
        class Test {}`;

      assertSuccess('inline-template-max-lines', source);
    });
  });

  describe('component has template url defined', () => {
    it('should not report any failure', () => {
      let source = `
        @Component({
          selector: 'foobar',
          templateUrl: './valid.html'
        })
        class Test {}`;

      const ast = getAst(source, __dirname + '/../../test/fixtures/angularWhitespace/component.ts');
      assertSuccess('inline-template-max-lines', ast);
    });
  });
});
