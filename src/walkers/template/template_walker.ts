import {
  TemplateAstVisitor,
  NgContentAst,
  EmbeddedTemplateAst,
  ElementAst,
  VariableAst,
  BoundElementPropertyAst,
  BoundEventAst,
  AttrAst,
  DirectiveAst,
  BoundDirectivePropertyAst,
  TextAst,
  BoundTextAst,
  templateVisitAll
} from 'angular2/src/compiler/compiler';

export class TemplateWalker implements TemplateAstVisitor {
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.children);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.vars);
    templateVisitAll(this, ast.outputs);
  }
  visitElement(ast: ElementAst, context: any): any {
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.children);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.inputs);
  }
  visitDirective(ast: DirectiveAst, context: any): any {
    templateVisitAll(this, ast.hostEvents);
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.hostProperties);
  }
  visitVariable(ast: VariableAst, context: any): any {}
  visitEvent(ast: BoundEventAst, context: any): any {}
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {}
  visitAttr(ast: AttrAst, context: any): any {}
  visitBoundText(ast: BoundTextAst, context: any): any {}
  visitText(ast: TextAst, context: any): any {}
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {}
  visitNgContent(ast: NgContentAst, context: any): any {}
}