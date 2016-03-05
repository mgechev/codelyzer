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
import {TemplateWalker} from './template_walker';

export class TemplateValidationWalker extends TemplateWalker {
  visitVariable(ast: VariableAst, context: any): any {
    console.log('Visiting template variable', ast.value);
  }
  visitEvent(ast: BoundEventAst, context: any): any {
    console.log('Visiting event', ast.name);
  }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {
    console.log('Visiting element property', ast.name);
  }
  visitAttr(ast: AttrAst, context: any): any {
    console.log('Visiting element attribute', ast.name);
  }
  visitBoundText(ast: BoundTextAst, context: any): any {}
  visitText(ast: TextAst, context: any): any {}
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {
    console.log('Visiting directive property', ast.value);
  }
  visitNgContent(ast: NgContentAst, context: any): any {}
}