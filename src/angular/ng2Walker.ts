import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import * as compiler from '@angular/compiler';
import {
  TemplateAst,
  ElementAst,
  AttrAst,
  TextAst,
  BoundTextAst,
  BoundElementPropertyAst,
  BoundEventAst,
  PropertyBindingType
} from '@angular/compiler';
import * as e from '@angular/compiler/src/expression_parser/ast';

import { parseTemplate } from './templateParser';
import { RecursiveAngularExpressionVisitor } from './recursiveAngularExpressionVisitor';
import { ExpTypes } from './expressionTypes';

const getDecoratorName = (decorator: ts.Decorator) => {
  let baseExpr = <any>decorator.expression || {};
  let expr = baseExpr.expression || {};
  return expr.text;
};

const getDecoratorStringArgs = (decorator: ts.Decorator) => {
  let baseExpr = <any>decorator.expression || {};
  let args = baseExpr.arguments || [];
  return args.map(a => (a.kind === ts.SyntaxKind.StringLiteral) ? a.text : null);
};

export interface RecursiveAngularExpressionVisitorCtr {
  new(sourceFile: ts.SourceFile, options: Lint.IOptions, context: ts.ClassDeclaration, basePosition: number);
}

const getExpressionDisplacement = (binding: any) => {
  let attrLen = 0;
  let valLen = 0;
  let totalLength = 0;
  let result = 0;
  if (binding instanceof BoundEventAst || binding instanceof BoundElementPropertyAst) {
    // subBindingLen is for [class.foo], [style.foo], the length of
    // the binding type. For event it is 0. (+1 because of the ".")
    let subBindingLen = 0;
    if (binding instanceof BoundElementPropertyAst) {
      let prop: BoundElementPropertyAst = <BoundElementPropertyAst>binding;
      // The length of the binding type
      switch (prop.type) {
        case PropertyBindingType.Animation:
        subBindingLen = 'animate'.length + 1;
        break;
        case PropertyBindingType.Attribute:
        subBindingLen = 'attr'.length + 1;
        break;
        case PropertyBindingType.Class:
        subBindingLen = 'class'.length + 1;
        break;
        case PropertyBindingType.Style:
        subBindingLen = 'style'.length + 1;
        break;
      }
    }
    // For [class.foo]=":
    // - Add the name of the binding (binding.name.length).
    // - 4 characters because of []=" (we already have the "." from above).
    // - subBindingLen is from above and applies only for elements.
    attrLen = binding.name.length + 4 + subBindingLen;
    // Total length of the attribute value
    if (binding instanceof BoundEventAst) {
      valLen = binding.handler.span.end;
    } else {
      valLen = binding.value.span.end;
    }
    // Total length of the entire part of the template AST corresponding to this AST.
    totalLength = binding.sourceSpan.end.offset - binding.sourceSpan.start.offset;
    // The whitespace are possible only in:
    // `[foo.bar]          =         "...."`,
    // and they are verything except the attrLen and the valLen (-1 because of the close quote).
    let whitespace = totalLength - (attrLen + valLen) - 1;
    // The resulted displacement is the length of the attribute + the whitespaces which
    // can be located ONLY before the value (the binding).
    result = whitespace + attrLen + binding.sourceSpan.start.offset;
  } else if (binding instanceof BoundTextAst) {
    result = binding.sourceSpan.start.offset;
  }
  return result;
};

export class Ng2Walker extends Lint.RuleWalker {
  constructor(sourceFile: ts.SourceFile,
    private _originalOptions: Lint.IOptions,
    private TemplateVisitorCtr: RecursiveAngularExpressionVisitorCtr = RecursiveAngularExpressionVisitor) {
    super(sourceFile, _originalOptions);
  }

  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    (<ts.Decorator[]>declaration.decorators || []).forEach(this.visitClassDecorator.bind(this));
    super.visitClassDeclaration(declaration);
  }

  visitMethodDeclaration(method: ts.MethodDeclaration) {
    (<ts.Decorator[]>method.decorators || []).forEach(this.visitMethodDecorator.bind(this));
    super.visitMethodDeclaration(method);
  }

  visitPropertyDeclaration(prop: ts.PropertyDeclaration) {
    (<ts.Decorator[]>prop.decorators || []).forEach(this.visitPropertyDecorator.bind(this));
    super.visitPropertyDeclaration(prop);
  }

  protected visitMethodDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);
    if (name === 'HostListener') {
      this.visitNg2HostListener(<ts.MethodDeclaration>decorator.parent,
          decorator, getDecoratorStringArgs(decorator));
    }
  }

  protected visitPropertyDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);
    switch (name) {
      case 'Input':
      this.visitNg2Input(<ts.PropertyDeclaration>decorator.parent,
          decorator, getDecoratorStringArgs(decorator));
      break;
      case 'Output':
      this.visitNg2Output(<ts.PropertyDeclaration>decorator.parent,
          decorator, getDecoratorStringArgs(decorator));
      break;
      case 'HostBinding':
      this.visitNg2HostBinding(<ts.PropertyDeclaration>decorator.parent,
          decorator, getDecoratorStringArgs(decorator));
      break;
    }
  }

  protected visitClassDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);
    if (name === 'Component') {
      this.visitNg2Component(<ts.ClassDeclaration>decorator.parent, decorator);
      if (!(<ts.ObjectLiteralExpression>(<ts.CallExpression>decorator.expression).arguments[0]).properties) {
        return;
      }
      const inlineTemplate = (<ts.ObjectLiteralExpression>
          (<ts.CallExpression>decorator.expression).arguments[0])
            .properties.map((prop: any) => {
            if (prop.name.text === 'template') {
              return prop;
            }
            return null;
          }).filter((el: any) => !!el).map((prop: any) => prop.initializer).pop();
      if (inlineTemplate) {
        this.visitNg2TemplateHelper(parseTemplate(inlineTemplate.text),
            <ts.ClassDeclaration>decorator.parent, inlineTemplate.pos + 2); // skip the quote
      }
    } else if (name === 'Directive') {
      this.visitNg2Directive(<ts.ClassDeclaration>decorator.parent, decorator);
    }
  }

  protected visitNg2TemplateAST(ast: e.AST, context: ts.ClassDeclaration, templateStart: number) {
    const templateVisitor =
      new this.TemplateVisitorCtr(this.getSourceFile(), this._originalOptions, context, templateStart);
    templateVisitor.visit(ast);
    templateVisitor.getFailures().forEach(f => this.addFailure(f));
  }

  protected visitNg2TemplateBoundText(text: BoundTextAst, context: ts.ClassDeclaration, templateStart: number) {
    if (ExpTypes.ASTWithSource(text.value)) {
      // Note that will not be reliable for different interpolation symbols
      const ast: any = (<e.ASTWithSource>text.value).ast;
      ast.expression = (<any>text.value).source;
      this.visitNg2TemplateAST(ast,
          context, templateStart + getExpressionDisplacement(text));
    }
  }

  protected visitNg2TemplateBoundElementPropertyAst(prop: BoundElementPropertyAst,
      context: ts.ClassDeclaration, templateStart: number) {
    this.visitNg2TemplateAST(prop.value, context, templateStart + getExpressionDisplacement(prop));
  }

  protected visitNg2TemplateBoundElementEventAst(event: BoundEventAst, context: ts.ClassDeclaration, templateStart: number) {
    this.visitNg2TemplateAST(event.handler, context,
        templateStart + getExpressionDisplacement(event));
  }

  protected visitNg2TemplateElement(element: ElementAst, context: ts.ClassDeclaration,
      templateStart: number) {
    element.inputs.forEach(i => this.visitNg2TemplateBoundElementPropertyAst(i, context, templateStart));
    element.outputs.forEach(o => this.visitNg2TemplateBoundElementEventAst(o, context, templateStart));
    element.attrs.forEach(a => this.visitNg2TemplateAttribute(a, templateStart));
    element.children.forEach(e => this.visitNg2Template(e, context, templateStart));
  }

  protected visitNg2Component(controller: ts.ClassDeclaration, decorator: ts.Decorator) {}

  protected visitNg2Directive(controller: ts.ClassDeclaration, decorator: ts.Decorator) {}

  protected visitNg2Input(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {}

  protected visitNg2Output(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {}

  protected visitNg2HostBinding(property: ts.PropertyDeclaration, decorator: ts.Decorator, args: string[]) {}

  protected visitNg2HostListener(method: ts.MethodDeclaration, decorator: ts.Decorator, args: string[]) {}

  protected visitNg2TemplateAttribute(attr: AttrAst, templateStart: number) {}

  protected visitNg2TemplateText(text: TextAst, context: ts.ClassDeclaration, templateStart: number) {}

  protected visitNg2Template(root: TemplateAst, context: ts.ClassDeclaration, templateStart: number) {
    if (root instanceof ElementAst) {
      return this.visitNg2TemplateElement(<ElementAst>root, context, templateStart);
    } else if (root instanceof TextAst) {
      return this.visitNg2TemplateText(<TextAst>root, context, templateStart);
    } else if (root instanceof BoundTextAst) {
      return this.visitNg2TemplateBoundText(root, context, templateStart);
    }
  }

  private visitNg2TemplateHelper(roots: compiler.TemplateAst[], context: ts.ClassDeclaration, baseStart: number) {
    if (!roots || !roots.length) {
      return;
    } else {
      roots.forEach((root: compiler.TemplateAst) =>
        this.visitNg2Template(root, context, baseStart));
    }
  }
}

