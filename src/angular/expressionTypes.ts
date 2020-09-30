export const ExpTypes = {
  Binary(ast: any) {
    return ast.constructor.name === 'Binary';
  },

  Quote(ast: any) {
    return ast.constructor.name === 'Quote';
  },

  EmptyExpr(ast: any) {
    return ast.constructor.name === 'EmptyExpr';
  },

  ImplicitReceiver(ast: any) {
    return ast.constructor.name === 'ImplicitReceiver';
  },

  Chain(ast: any) {
    return ast.constructor.name === 'Chain';
  },

  Conditional(ast: any) {
    return ast.constructor.name === 'Conditional';
  },

  PropertyRead(ast: any) {
    return ast.constructor.name === 'PropertyRead';
  },

  PropertyWrite(ast: any) {
    return ast.constructor.name === 'PropertyWrite';
  },

  SafePropertyRead(ast: any) {
    return ast.constructor.name === 'SafePropertyRead';
  },

  KeyedRead(ast: any) {
    return ast.constructor.name === 'KeyedRead';
  },

  KeyedWrite(ast: any) {
    return ast.constructor.name === 'KeyedWrite';
  },

  BindingPipe(ast: any) {
    return ast.constructor.name === 'BindingPipe';
  },

  LiteralPrimitive(ast: any) {
    return ast.constructor.name === 'LiteralPrimitive';
  },

  LiteralArray(ast: any) {
    return ast.constructor.name === 'LiteralArray';
  },

  LiteralMap(ast: any) {
    return ast.constructor.name === 'LiteralMap';
  },

  Interpolation(ast: any) {
    return ast.constructor.name === 'Interpolation';
  },

  PrefixNot(ast: any) {
    return ast.constructor.name === 'PrefixNot';
  },

  MethodCall(ast: any) {
    return ast.constructor.name === 'MethodCall';
  },

  SafeMethodCall(ast: any) {
    return ast.constructor.name === 'SafeMethodCall';
  },

  FunctionCall(ast: any) {
    return ast.constructor.name === 'FunctionCall';
  },

  ASTWithSource(ast: any) {
    return ast.constructor.name === 'ASTWithSource';
  },
};
