import * as ast from '@angular/compiler';
import { FlatSymbolTable } from './recursiveAngularExpressionVisitor';

export class ReferenceCollectorVisitor implements ast.TemplateAstVisitor {
  private _variables: FlatSymbolTable = {};

  visit?(node: ast.TemplateAst, context: any): FlatSymbolTable {
    node.visit(this, context);
    return this._variables;
  }

  visitBoundText(text: ast.BoundTextAst, context: any): any {}

  visitElementProperty(prop: ast.BoundElementPropertyAst, context: any): any {}

  visitReference(ast: ast.ReferenceAst, context: any): any {}

  visitNgContent(ast: ast.NgContentAst, context: any): any {}

  visitVariable(ast: ast.VariableAst, context: any): any {}

  visitAttr(ast: ast.AttrAst, context: any): any {}

  visitText(text: ast.TextAst, context: any): any {}

  visitDirective(ast: ast.DirectiveAst, context: any): any {}

  visitDirectiveProperty(ast: ast.BoundDirectivePropertyAst, context: any): any {}

  visitEvent(ast: ast.BoundEventAst, context: any): any {}

  visitEmbeddedTemplate(ast: ast.EmbeddedTemplateAst, context: any): any {
    ast.references.forEach((r) => (this._variables[r.name] = true));
    ast.children.forEach((e) => this.visit!(e, context));
  }

  visitElement(element: ast.ElementAst, context: any): any {
    element.references.forEach((r) => (this._variables[r.name] = true));
    element.children.forEach((e) => this.visit!(e, context));
  }

  get variables() {
    return this._variables;
  }
}
