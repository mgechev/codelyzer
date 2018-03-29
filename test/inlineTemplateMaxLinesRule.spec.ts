import * as ts from 'typescript';

import { assertFailure, assertSuccess } from './testHelper';

const getAst = (code: string, file = 'file.ts') => {
  return ts.createSourceFile(file, code, ts.ScriptTarget.ES5, true);
};

describe('inline-template-max-lines', () => {
  describe('template', () => {
    describe('component has inline template', () => {
      it('should succeed when lines limit not exceeded', () => {
        const source = `
        @Component({
          selector: 'foobar',
          template: \`<div>just one line template</div>\`
        })
        class Test {}`;

        assertSuccess('inline-template-max-lines', source);
      });

      it('should fail when lines limit exceeded default 3 lines limit', () => {
        const source = `
        @Component({
          selector: 'foobar',
          template: \`<div>first line</div>
                      <div>second line</div>
                      <div>third line</div>
                      <div>fourth line</div>\`
        })
        class Test {}`;

        assertFailure('inline-template-max-lines', source, {
          message: 'Inline template lines limit exceeded. Defined limit: 3 / template lines: 4',
          startPosition: {character: 20, line: 3},
          endPosition: {character: 45, line: 6},
        });
      });

      it('should fail when lines limit exceeded custom defined limit', () => {
        const source = `
        @Component({
          selector: 'foobar',
          template: \`<div>first line</div>\`
        })
        class Test {}`;

        const options = [true, {template: 0}];
        assertFailure('inline-template-max-lines', source, {
          message: 'Inline template lines limit exceeded. Defined limit: 0 / template lines: 1',
          startPosition: {character: 20, line: 3},
          endPosition: {character: 43, line: 3},
        }, options);
      });

      it('should use default limit if incorrect has been passed', () => {
        const source = `
        @Component({
          selector: 'foobar',
          template: \`<div>first line</div>\`
        })
        class Test {}`;

        const options = [true, {template: -5}];
        assertSuccess('inline-template-max-lines', source, options);
      });
    });

    describe('component hasn`t inline template', () => {
      it('should not report any failure', () => {
        const source = `
        @Component({
          selector: 'foobar',
        })
        class Test {}`;

        assertSuccess('inline-template-max-lines', source);
      });
    });

    describe('component has template url defined', () => {
      it('should not report any failure', () => {
        const source = `
        @Component({
          selector: 'foobar',
          templateUrl: './foo.html'
        })
        class Test {}`;

        const ast = getAst(source, __dirname + '/../../test/fixtures/inlineTemplateMaxLines/foo.ts');
        assertSuccess('inline-template-max-lines', ast);
      });
    });
  });

  describe('styles', () => {
    describe('component has inline styles', () => {
      it('should succeed when lines limit not exceeded', () => {
        const source = `
        @Component({
          selector: 'foobar',
          styles: [\`display: none;\`]
        })
        class Test {}`;

        assertSuccess('inline-template-max-lines', source);
      });
    });

    it('should fail when lines limit exceeded default 3 lines limit', () => {
      const source = `
        @Component({
          selector: 'foobar',
          styles: [\`display: block;
                     width: 30px;
                     height: 40px;
                     float: left;\`]
        })
        class Test {}`;

      assertFailure('inline-template-max-lines', source, {
        message: 'Inline styles lines limit exceeded. Defined limit: 3 / styles lines: 4',
        startPosition: {character: 19, line: 3},
        endPosition: {character: 34, line: 6},
      });
    });

    it('should fail when sum of lines (from separate inline styles) limit exceeded default 3 lines limit', () => {
      const source = `
        @Component({
          selector: 'foobar',
          styles: [\`display: block;
                     width: 30px;\`,
                     \`height: 40px;
                     float: left;\`]
        })
        class Test {}`;

      assertFailure('inline-template-max-lines', source, {
        message: 'Inline styles lines limit exceeded. Defined limit: 3 / styles lines: 4',
        startPosition: {character: 19, line: 3},
        endPosition: {character: 34, line: 4},
      });

      assertFailure('inline-template-max-lines', source, {
        message: 'Inline styles lines limit exceeded. Defined limit: 3 / styles lines: 4',
        startPosition: {character: 21, line: 5},
        endPosition: {character: 34, line: 6},
      }, null, 1);
    });

    it('should fail when lines limit exceeded custom defined limit', () => {
      const source = `
        @Component({
          selector: 'foobar',
          styles: [\`display: none;\`]
        })
        class Test {}`;

      const options = [true, {styles: 0}];
      assertFailure('inline-template-max-lines', source, {
        message: 'Inline styles lines limit exceeded. Defined limit: 0 / styles lines: 1',
        startPosition: {character: 19, line: 3},
        endPosition: {character: 35, line: 3},
      }, options);
    });

    it('should use default limit if incorrect has been passed', () => {
      const source = `
        @Component({
          selector: 'foobar',
          styles: [\`display: none;\`]
        })
        class Test {}`;

      const options = [true, {styles: -5}];
      assertSuccess('inline-template-max-lines', source, options);
    });

    describe('component hasn`t inline styles', () => {
      it('should not report any failure', () => {
        const source = `
        @Component({
          selector: 'foobar',
        })
        class Test {}`;

        assertSuccess('inline-template-max-lines', source);
      });
    });

    describe('component has styles url defined', () => {
      it('should not report any failure', () => {
        const source = `
        @Component({
          selector: 'foobar',
          styleUrls: ['./foo.css']
        })
        class Test {}`;

        const ast = getAst(source, __dirname + '/../../test/fixtures/inlineTemplateMaxLines/foo.ts');
        assertSuccess('inline-template-max-lines', ast);
      });
    });
  });
});
