import * as ts from 'typescript';

export const isSimpleTemplateString = (e: any): e is ts.SyntaxKind.FirstTemplateToken | ts.StringLiteral => {
  return e.kind === ts.SyntaxKind.StringLiteral || e.kind === ts.SyntaxKind.FirstTemplateToken;
};

export const getClassName = (property: ts.PropertyDeclaration): string | undefined => {
  const { parent } = property;
  const identifier = parent && ts.isClassDeclaration(parent) ? parent.name : undefined;

  return identifier && ts.isIdentifier(identifier) ? identifier.text : undefined;
};

export const getDecoratorArgument = (decorator: ts.Decorator): ts.ObjectLiteralExpression | undefined => {
  const { expression } = decorator;

  if (ts.isCallExpression(expression) && expression.arguments && expression.arguments.length > 0) {
    const args = expression.arguments[0];

    if (ts.isObjectLiteralExpression(args) && args.properties) {
      return args;
    }
  }

  return undefined;
};

export const getDecoratorPropertyInitializer = (decorator: ts.Decorator, name: string) => {
  const args = ts.isCallExpression(decorator.expression) ? decorator.expression.arguments[0] : undefined;
  const properties = ts.createNodeArray(args && ts.isObjectLiteralExpression(args) ? args.properties : undefined);

  return properties
    .filter(prop => prop.name && ts.isIdentifier(prop.name) && prop.name.text === name)
    .map(prop => (ts.isPropertyAssignment(prop) ? prop.initializer : undefined))
    .pop();
};

export const getDecoratorName = (decorator: ts.Decorator): string | undefined => {
  return ts.isCallExpression(decorator.expression) && ts.isIdentifier(decorator.expression.expression)
    ? decorator.expression.expression.text
    : undefined;
};

export const getComponentDecorator = (declaration: ts.ClassDeclaration) => {
  return ts.createNodeArray(declaration.decorators).find(d => {
    return (
      ts.isCallExpression(d.expression) &&
      d.expression.arguments &&
      d.expression.arguments.length > 0 &&
      getDecoratorName(d) === 'Component'
    );
  });
};

export const getSymbolName = (expression: ts.ExpressionWithTypeArguments): string => {
  const { expression: childExpression } = expression;

  return ts.isPropertyAccessExpression(childExpression) ? childExpression.name.getText() : childExpression.getText();
};

export const maybeNodeArray = <T extends ts.Node>(nodes: ts.NodeArray<T>): ReadonlyArray<T> => {
  return nodes || [];
};
