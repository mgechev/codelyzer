import { expect } from 'chai';
import { renderSync } from 'node-sass';
import * as ts from 'typescript';

import { SourceMappingVisitor } from '../../src/angular/sourceMappingVisitor';
import { getDecoratorPropertyInitializer } from '../../src/util/utils';

const getAst = (code: string, file = 'file.ts') => {
  return ts.createSourceFile(file, code, ts.ScriptTarget.ES5, true);
};

const fixture1 = `@Component({
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

const last = <T extends ts.Node>(nodes: ts.NodeArray<T>) => nodes[nodes.length - 1];

describe('SourceMappingVisitor', () => {
  it('should map to correct position', () => {
    const ast = getAst(fixture1);
    const classDeclaration = last(ast.statements);
    const styles = getDecoratorPropertyInitializer(last(classDeclaration.decorators!), 'styles');
    const styleNode = (styles as ts.ArrayLiteralExpression).elements[0];
    const scss = (styleNode as any).text;
    const result = renderSync({ outFile: '/tmp/bar', data: scss, sourceMap: true });
    const visitor = new SourceMappingVisitor(
      ast,
      {
        disabledIntervals: [],
        ruleArguments: [],
        ruleName: 'foo',
        ruleSeverity: 'warning',
      },
      {
        code: result.css.toString(),
        map: JSON.parse(result.map.toString()),
        source: scss,
      },
      styleNode.getStart() + 1
    );
    visitor.addFailureAt(0, 3, 'bar');
    const failure = visitor.getFailures()[0];
    expect(failure.getStartPosition().getPosition()).eq(34);
    expect(failure.getEndPosition().getPosition()).eq(38);
  });
});
