import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import * as compiler from '@angular/compiler';
import {
  TemplateAst
} from '@angular/compiler';
import { parseTemplate } from './templates/templateParser';

import {parseCss} from './styles/parseCss';
import {CssAst} from './styles/cssAst';
import {BasicCssAstVisitor, CssAstVisitorCtrl} from './styles/basicCssAstVisitor';

import {RecursiveAngularExpressionVisitorCtr, BasicTemplateAstVisitor, TemplateAstVisitorCtr} from './templates/basicTemplateAstVisitor';
import { RecursiveAngularExpressionVisitor } from './templates/recursiveAngularExpressionVisitor';

import {getDecoratorName, isSimpleTemplateString, getDecoratorPropertyInitializer} from '../util/utils';

import SyntaxKind = require('../util/syntaxKind');


const getDecoratorStringArgs = (decorator: ts.Decorator) => {
  let baseExpr = <any>decorator.expression || {};
  let args = baseExpr.arguments || [];
  return args.map(a => (a.kind === ts.SyntaxKind.StringLiteral) ? a.text : null);
};

export interface Ng2WalkerConfig {
  expressionVisitorCtrl?: RecursiveAngularExpressionVisitorCtr;
  templateVisitorCtrl?: TemplateAstVisitorCtr;
  cssVisitorCtrl?: CssAstVisitorCtrl;
}

export class Ng2Walker extends Lint.RuleWalker {
  constructor(sourceFile: ts.SourceFile,
    protected _originalOptions: Lint.IOptions,
    private _config?: Ng2WalkerConfig) {
    super(sourceFile, _originalOptions);
    this._normalizeConfig(_config);
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
    // Not invoked @Component or @Pipe, or @Directive
    if (!(<ts.CallExpression>decorator.expression).arguments ||
        !(<ts.CallExpression>decorator.expression).arguments.length ||
        !(<ts.ObjectLiteralExpression>(<ts.CallExpression>decorator.expression).arguments[0]).properties) {
      return;
    }

    if (name === 'Component') {
      this.visitNg2Component(<ts.ClassDeclaration>decorator.parent, decorator);
      const inlineTemplate = getDecoratorPropertyInitializer(decorator, 'template');
      if (inlineTemplate) {
        try {
          if (isSimpleTemplateString(inlineTemplate)) {

            const templateAst = parseTemplate(inlineTemplate.text);
            this.visitNg2TemplateHelper(templateAst,
                <ts.ClassDeclaration>decorator.parent, inlineTemplate.pos + 2); // skip the quote
          }
        } catch (e) {
          console.error('Cannot parse the template of', ((<any>decorator.parent || {}).name || {}).text);
        }
      }
      const inlineStyles = getDecoratorPropertyInitializer(decorator, 'styles');
      if (inlineStyles && inlineStyles.kind === SyntaxKind.current().ArrayLiteralExpression) {
        inlineStyles.elements.forEach((inlineStyle: any) => {
          try {
            if (isSimpleTemplateString(inlineStyle)) {
              this.visitNg2StyleHelper(
                parseCss(inlineStyle.text),
                <ts.ClassDeclaration>decorator.parent,
                inlineStyle.pos + 2);
            }
          } catch (e) {
            console.error('Cannot parse styles of', ((<any>decorator.parent || {}).name || {}).text);
          }
        });
      }
    } else if (name === 'Directive') {
      this.visitNg2Directive(<ts.ClassDeclaration>decorator.parent, decorator);
    } else if (name === 'Pipe') {
      this.visitNg2Pipe(<ts.ClassDeclaration>decorator.parent, decorator);
    }
  }

  protected visitNg2Component(controller: ts.ClassDeclaration, decorator: ts.Decorator) {}

  protected visitNg2Directive(controller: ts.ClassDeclaration, decorator: ts.Decorator) {}

  protected visitNg2Pipe(controller: ts.ClassDeclaration, decorator: ts.Decorator) {}

  protected visitNg2Input(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {}

  protected visitNg2Output(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {}

  protected visitNg2HostBinding(property: ts.PropertyDeclaration, decorator: ts.Decorator, args: string[]) {}

  protected visitNg2HostListener(method: ts.MethodDeclaration, decorator: ts.Decorator, args: string[]) {}

  protected visitNg2TemplateHelper(roots: compiler.TemplateAst[], context: ts.ClassDeclaration, baseStart: number) {
    if (!roots || !roots.length) {
      return;
    } else {
      const visitor =
        new this._config.templateVisitorCtrl(
          this.getSourceFile(), this._originalOptions, context, baseStart, this._config.expressionVisitorCtrl);
      roots.forEach(r => r.visit(visitor, null));
      // roots.forEach((root: compiler.TemplateAst) => visitor.visit(root));
      visitor.getFailures().forEach(f => this.addFailure(f));
    }
  }

  protected visitNg2StyleHelper(style: CssAst, context: ts.ClassDeclaration, baseStart: number) {
    if (!style) {
      return;
    } else {
      const visitor = new this._config.cssVisitorCtrl(this.getSourceFile(), this._originalOptions, context, baseStart);
      style.visit(visitor);
      visitor.getFailures().forEach(f => this.addFailure(f));
    }
  }

  private _normalizeConfig(config?: Ng2WalkerConfig) {
    this._config = Object.assign({
      templateVisitorCtrl: BasicTemplateAstVisitor,
      expressionVisitorCtrl: RecursiveAngularExpressionVisitor,
      cssVisitorCtrl: BasicCssAstVisitor
    }, this._config || {});
  }
}

