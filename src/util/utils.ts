import * as ts from 'typescript';
const SyntaxKind = require('./syntaxKind');

// Lewenshtein algorithm
export const stringDistance = (s: string, t: string, ls = s.length, lt = t.length) => {
  let memo = {};
  let currRowMemo;
  let i: number;
  let k: number;
  for (k = 0; k <= lt; k += 1) {
    memo[k] = k;
  }
  for (i = 1; i <= ls; i += 1) {
    currRowMemo = [i];
    for (k = 1; k <= lt; k += 1) {
      currRowMemo[k] = Math.min(currRowMemo[k - 1] + 1, memo[k] + 1, memo[k - 1] + (s[i - 1] !== t[k - 1] ? 1 : 0));
    }
    memo = currRowMemo;
  }
  return memo[lt];
};

export const isSimpleTemplateString = (e: any) => {
  return e.kind === ts.SyntaxKind.StringLiteral || e.kind === SyntaxKind.current().FirstTemplateToken;
};

export const getDecoratorPropertyInitializer = (decorator: ts.Decorator, name: string) => {
  return (
    (<ts.ObjectLiteralExpression>(<ts.CallExpression>decorator.expression).arguments[0]).properties
      // .map(prop => ((prop.name as any).text === name) ? prop : null)
      .filter(prop => (prop.name as any).text === name)
      .map((prop: any) => prop.initializer)
      .pop()
  );
};

export const getDecoratorName = (decorator: ts.Decorator): string | undefined => {
  return ts.isCallExpression(decorator.expression) && ts.isIdentifier(decorator.expression.expression)
    ? decorator.expression.expression.text
    : undefined;
};

export const getComponentDecorator = (declaration: ts.ClassDeclaration) => {
  return ([].slice.apply(declaration.decorators) || [])
    .filter(d => {
      if (
        !(<ts.CallExpression>d.expression).arguments ||
        !(<ts.CallExpression>d.expression).arguments.length ||
        !(<ts.ObjectLiteralExpression>(<ts.CallExpression>d.expression).arguments[0]).properties
      ) {
        return false;
      }
      const name = getDecoratorName(d);
      if (name === 'Component') {
        return true;
      }
    })
    .pop();
};

export const getInterfaceName = (expression: ts.ExpressionWithTypeArguments): string => {
  const { expression: childExpression } = expression;

  return ts.isPropertyAccessExpression(childExpression) ? childExpression.name.getText() : childExpression.getText();
};

export const maybeNodeArray = <T extends ts.Node>(nodes: ts.NodeArray<T>): ReadonlyArray<T> => {
  if (!nodes) {
    return [];
  }
  return nodes;
};
