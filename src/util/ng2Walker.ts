import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import * as compiler from '@angular/compiler';
import { TemplateAst, ElementAst, AttrAst, TextAst, BoundTextAst, BoundElementPropertyAst, BoundEventAst } from '@angular/compiler';
import * as e from '@angular/compiler/src/expression_parser/ast';

import {parseTemplate} from './templateParser';

const ExpTypes = {
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
  }
};

const getDecoratorName = (decorator: ts.Decorator) => {
  let baseExpr = <any>decorator.expression || {};
  let expr = baseExpr.expression || {};
  return expr.text;
};

const getDecoratorStringArgs = (decorator: ts.Decorator) => {
  let baseExpr = <any>decorator.expression || {};
  let expr = baseExpr.expression || {};
  let args = baseExpr.arguments || [];
  return args.map(a => (a.kind === ts.SyntaxKind.StringLiteral) ? a.text : null);
};

export interface RecursiveAngularExpressionVisitorCtr {
  new(sourceFile: ts.SourceFile, options: Lint.IOptions, context: ts.ClassDeclaration, basePosition: number);
}

export class RecursiveAngularExpressionVisitor extends Lint.RuleWalker implements e.AstVisitor {
  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions, protected context: ts.ClassDeclaration, protected basePosition: number) {
    super(sourceFile, options);
  }
  visit(ast: e.AST, context: any) {
    ast.visit(this);
    return null;
  }
  visitBinary(ast: e.Binary, context: any): any {
    ast.left.visit(this);
    ast.right.visit(this);
    return null;
  }
  visitChain(ast: e.Chain, context: any): any { return this.visitAll(ast.expressions, context); }
  visitConditional(ast: e.Conditional, context: any): any {
    ast.condition.visit(this);
    ast.trueExp.visit(this);
    ast.falseExp.visit(this);
    return null;
  }
  visitPipe(ast: e.BindingPipe, context: any): any {
    ast.exp.visit(this);
    this.visitAll(ast.args, context);
    return null;
  }
  visitFunctionCall(ast: e.FunctionCall, context: any): any {
    ast.target.visit(this);
    this.visitAll(ast.args, context);
    return null;
  }
  visitImplicitReceiver(ast: e.ImplicitReceiver, context: any): any { return null; }
  visitInterpolation(ast: e.Interpolation, context: any): any {
    return this.visitAll(ast.expressions, context);
  }
  visitKeyedRead(ast: e.KeyedRead, context: any): any {
    ast.obj.visit(this);
    ast.key.visit(this);
    return null;
  }
  visitKeyedWrite(ast: e.KeyedWrite, context: any): any {
    ast.obj.visit(this);
    ast.key.visit(this);
    ast.value.visit(this);
    return null;
  }
  visitLiteralArray(ast: e.LiteralArray, context: any): any {
    return this.visitAll(ast.expressions, context);
  }
  visitLiteralMap(ast: e.LiteralMap, context: any): any { return this.visitAll(ast.values, context); }
  visitLiteralPrimitive(ast: e.LiteralPrimitive, context: any): any { return null; }
  visitMethodCall(ast: e.MethodCall, context: any): any {
    ast.receiver.visit(this);
    return this.visitAll(ast.args, context);
  }
  visitPrefixNot(ast: e.PrefixNot, context: any): any {
    ast.expression.visit(this);
    return null;
  }
  visitPropertyRead(ast: e.PropertyRead, context: any): any {
    ast.receiver.visit(this);
    return null;
  }
  visitPropertyWrite(ast: e.PropertyWrite, context: any): any {
    ast.receiver.visit(this);
    ast.value.visit(this);
    return null;
  }
  visitSafePropertyRead(ast: e.SafePropertyRead, context: any): any {
    ast.receiver.visit(this);
    return null;
  }
  visitSafeMethodCall(ast: e.SafeMethodCall, context: any): any {
    ast.receiver.visit(this);
    return this.visitAll(ast.args, context);
  }
  visitAll(asts: e.AST[], context: any): any {
    asts.forEach(ast => ast.visit(this, context));
    return null;
  }
  visitQuote(ast: e.Quote, context: any): any { return null; }
}

export class Ng2Walker extends Lint.RuleWalker {
  constructor(sourceFile: ts.SourceFile,
    private _originalOptions: Lint.IOptions,
    private TemplateVisitorCtr: RecursiveAngularExpressionVisitorCtr = RecursiveAngularExpressionVisitor) {
    super(sourceFile, _originalOptions);
  }

  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    (declaration.decorators || []).forEach(this.visitClassDecorator.bind(this));
    super.visitClassDeclaration(declaration);
  }

  visitMethodDeclaration(method: ts.MethodDeclaration) {
    (method.decorators || []).forEach(this.visitMethodDecorator.bind(this));
    super.visitMethodDeclaration(method);
  }

  protected visitMethodDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);
    if (name === 'HostListener') {
      this.visitNg2HostListener(<ts.MethodDeclaration>decorator.parent, decorator, getDecoratorStringArgs(decorator));
    }
  }

  visitPropertyDeclaration(prop: ts.PropertyDeclaration) {
    (prop.decorators || []).forEach(this.visitPropertyDecorator.bind(this));
    super.visitPropertyDeclaration(prop);
  }

  protected visitPropertyDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);
    switch (name) {
      case 'Input':
      this.visitNg2Input(<ts.PropertyDeclaration>decorator.parent, decorator, getDecoratorStringArgs(decorator));
      break;
      case 'Output':
      this.visitNg2Output(<ts.PropertyDeclaration>decorator.parent, decorator, getDecoratorStringArgs(decorator));
      break;
      case 'HostBinding':
      this.visitNg2HostBinding(<ts.PropertyDeclaration>decorator.parent, decorator, getDecoratorStringArgs(decorator));
      break;
    }
  }

  protected visitClassDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);
    if (name === 'Component') {
      this.visitNg2Component(<ts.ClassDeclaration>decorator.parent, decorator);
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
    const templateVisitor = new this.TemplateVisitorCtr(this.getSourceFile(), this._originalOptions, context, templateStart);
    templateVisitor.visit(ast);
    templateVisitor.getFailures().forEach(f => this.addFailure(f));
  }

  protected visitNg2TemplateBoundText(text: BoundTextAst, context: ts.ClassDeclaration, templateStart: number) {
    if (ExpTypes.ASTWithSource(text.value)) {
      // Note that will not be reliable on different interpolation symbols
      this.visitNg2TemplateAST((<e.ASTWithSource>text.value).ast, context, templateStart + text.sourceSpan.start.offset + 2); // because of {{
    }
  }

  protected visitNg2TemplateBoundElementPropertyAst(prop: BoundElementPropertyAst, context: ts.ClassDeclaration, templateStart: number) {
    const sf = this.getSourceFile().text;
    const start = templateStart + prop.sourceSpan.start.offset;
    const width = prop.sourceSpan.end.offset - prop.sourceSpan.start.offset;
    let equalIdx = start + sf.substr(start, width).indexOf('=');
    while (/\s/.test(sf[++equalIdx]) && sf[equalIdx]) {}
    this.visitNg2TemplateAST(prop.value, context, start + sf.substr(start, width).indexOf('=') + 2); // because of [name]="
  }

  protected visitNg2TemplateBoundElementEventAst(event: BoundEventAst, context: ts.ClassDeclaration, templateStart: number) {
    this.visitNg2TemplateAST(event.handler, context, templateStart + event.sourceSpan.start.offset + event.name.length + 4); // because of (name)="
  }

  protected visitNg2TemplateElement(element: ElementAst, context: ts.ClassDeclaration, templateStart: number) {
    element.inputs.forEach(i => this.visitNg2TemplateBoundElementPropertyAst(i, context, templateStart));
    element.outputs.forEach(o => this.visitNg2TemplateBoundElementEventAst(o, context, templateStart));
    element.attrs.forEach(a => this.visitNg2TemplateAttribute(a, templateStart));
    element.children.forEach(e => this.visitNg2Template(e, context, templateStart));
  }

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

  protected visitNg2Component(controller: ts.ClassDeclaration, decorator: ts.Decorator) {}

  protected visitNg2Directive(controller: ts.ClassDeclaration, decorator: ts.Decorator) {}

  protected visitNg2Input(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {}

  protected visitNg2Output(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {}

  protected visitNg2HostBinding(property: ts.PropertyDeclaration, decorator: ts.Decorator, args: string[]) {}

  protected visitNg2HostListener(method: ts.MethodDeclaration, decorator: ts.Decorator, args: string[]) {}
}