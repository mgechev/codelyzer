import * as ts from 'typescript';
import chai = require('chai');

import { getDecoratorPropertyInitializer } from '../../src/util/utils';
import { SourceMappingVisitor } from '../../src/angular/sourceMappingVisitor';
import { renderSync } from 'node-sass';

const getAst = (code: string, file = 'file.ts') => {
  return ts.createSourceFile(file, code, ts.ScriptTarget.ES2015, true);
};

const fixture1 =
`@Component({
  styles: [
    \`
    .foo {
      .bar {
        color: red;
      }
    }
    \`
  ]
})
export class Foo {}
`;

describe('SourceMappingVisitor', () => {

  it('should map to correct position', () => {
    const ast = getAst(fixture1);
    const classDeclaration = <ts.ClassDeclaration>ast.statements.pop();
    const styles = getDecoratorPropertyInitializer(classDeclaration.decorators.pop(), 'styles');
    const styleNode = <ts.Node>styles.elements[0];
    const scss = (<any>styleNode).text;
    const result = renderSync({ outFile: '/tmp/bar', data: scss, sourceMap: true });
    const visitor = new SourceMappingVisitor(ast, {
        disabledIntervals: null, ruleName: 'foo', ruleArguments: [], ruleSeverity: 'warning'
      }, {
      code: result.css.toString(),
      map: JSON.parse(result.map.toString()),
      source: scss
    }, styleNode.getStart() + 1);
    const failure = visitor.createFailure(0, 3, 'bar');
    chai.expect(failure.getStartPosition().getPosition()).eq(34);
    chai.expect(failure.getEndPosition().getPosition()).eq(38);
  });
});
