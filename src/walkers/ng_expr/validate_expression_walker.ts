import {
  RecursiveAstVisitor,
  MethodCall,
  FunctionCall,
  PropertyRead,
  SafeMethodCall,
  SafePropertyRead
} from 'angular2/src/core/change_detection/parser/ast';

class ValidateExpressionWalker extends RecursiveAstVisitor {
  visitMethodCall(ast: MethodCall) {
    super.visitMethodCall(ast);
  }
  visitPropertyRead(ast: PropertyRead) {
    super.visitPropertyRead(ast);
  }
  visitSafePropertyRead(ast: SafePropertyRead) {
    super.visitSafePropertyRead(ast);
  }
  visitSafeMethodCall(ast: SafeMethodCall) {
    super.visitSafeMethodCall(ast);
  }
}
