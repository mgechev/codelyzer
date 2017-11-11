import * as ts from 'typescript';
const SyntaxKind = require('./syntaxKind');

// Lewenshtein algorithm
export const stringDistance = (
  s: string,
  t: string,
  ls: number = s.length,
  lt: number = t.length
) => {
  let memo = [];
  let currRowMemo;
  let i;
  let k;
  for (k = 0; k <= lt; k += 1) {
    memo[k] = k;
  }
  for (i = 1; i <= ls; i += 1) {
    currRowMemo = [i];
    for (k = 1; k <= lt; k += 1) {
      currRowMemo[k] = Math.min(
        currRowMemo[k - 1] + 1,
        memo[k] + 1,
        memo[k - 1] + (s[i - 1] !== t[k - 1] ? 1 : 0)
      );
    }
    memo = currRowMemo;
  }
  return memo[lt];
};

export const isSimpleTemplateString = (e: any) => {
  return (
    e.kind === ts.SyntaxKind.StringLiteral ||
    e.kind === SyntaxKind.current().FirstTemplateToken
  );
};

export const getDecoratorPropertyInitializer = (
  decorator: ts.Decorator,
  name: string
) => {
  return (<ts.ObjectLiteralExpression>(<ts.CallExpression>decorator.expression)
    .arguments[0]).properties
    .map((prop: any) => {
      if (prop.name.text === name) {
        return prop;
      }
      return null;
    })
    .filter((el: any) => !!el)
    .map((prop: any) => prop.initializer)
    .pop();
};

export const getDecoratorName = (decorator: ts.Decorator) => {
  let baseExpr = <any>decorator.expression || {};
  let expr = baseExpr.expression || {};
  return expr.text;
};

export const getComponentDecorator = (declaration: ts.ClassDeclaration) => {
  return (<ts.Decorator[]>declaration.decorators || [])
    .filter((d: any) => {
      if (
        !(<ts.CallExpression>d.expression).arguments ||
        !(<ts.CallExpression>d.expression).arguments.length ||
        !(<ts.ObjectLiteralExpression>(<ts.CallExpression>d.expression)
          .arguments[0]).properties
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
