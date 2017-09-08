import * as Lint from 'tslint';
import * as ts from 'typescript';
import * as compiler from '@angular/compiler';
import { parseTemplate } from './templates/templateParser';

import { parseCss } from './styles/parseCss';
import { CssAst } from './styles/cssAst';
import { BasicCssAstVisitor, CssAstVisitorCtrl } from './styles/basicCssAstVisitor';

import {
  RecursiveAngularExpressionVisitorCtr,
  BasicTemplateAstVisitor,
  TemplateAstVisitorCtr
} from './templates/basicTemplateAstVisitor';
import { RecursiveAngularExpressionVisitor } from './templates/recursiveAngularExpressionVisitor';
import { ReferenceCollectorVisitor } from './templates/referenceCollectorVisitor';

import { MetadataReader } from './metadataReader';
import { ComponentMetadata, DirectiveMetadata, StyleMetadata } from './metadata';
import { ngWalkerFactoryUtils } from './ngWalkerFactoryUtils';

import { Config } from './config';

import { logger } from '../util/logger';
import { getDecoratorName } from '../util/utils';

const getDecoratorStringArgs = (decorator: ts.Decorator) => {
  let baseExpr = <any>decorator.expression || {};
  let args = baseExpr.arguments || [];
  return args.map(a => (a.kind === ts.SyntaxKind.StringLiteral) ? a.text : null);
};

export interface NgWalkerConfig {
  expressionVisitorCtrl?: RecursiveAngularExpressionVisitorCtr;
  templateVisitorCtrl?: TemplateAstVisitorCtr;
  cssVisitorCtrl?: CssAstVisitorCtrl;
}

export class NgWalker extends Lint.RuleWalker {

  constructor(sourceFile: ts.SourceFile,
              protected _originalOptions: Lint.IOptions,
              private _config?: NgWalkerConfig,
              protected _metadataReader?: MetadataReader) {

    super(sourceFile, _originalOptions);

    this._metadataReader = this._metadataReader || ngWalkerFactoryUtils.defaultMetadataReader();
    this._config = Object.assign({
      templateVisitorCtrl: BasicTemplateAstVisitor,
      expressionVisitorCtrl: RecursiveAngularExpressionVisitor,
      cssVisitorCtrl: BasicCssAstVisitor
    }, this._config || {});

  }

  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    const metadata = this._metadataReader.read(declaration);
    if (metadata instanceof ComponentMetadata) {
      this.visitNgComponent(metadata);
    } else if (metadata instanceof DirectiveMetadata) {
      this.visitNgDirective(metadata);
    }
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
      this.visitNgHostListener(<ts.MethodDeclaration>decorator.parent,
        decorator, getDecoratorStringArgs(decorator));
    }
  }

  protected visitPropertyDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);
    switch (name) {
      case 'Input':
        this.visitNgInput(<ts.PropertyDeclaration>decorator.parent,
          decorator, getDecoratorStringArgs(decorator));
        break;
      case 'Output':
        this.visitNgOutput(<ts.PropertyDeclaration>decorator.parent,
          decorator, getDecoratorStringArgs(decorator));
        break;
      case 'HostBinding':
        this.visitNgHostBinding(<ts.PropertyDeclaration>decorator.parent,
          decorator, getDecoratorStringArgs(decorator));
        break;
      case 'ContentChild':
        this.visitNgContentChild(<ts.PropertyDeclaration>decorator.parent,
          decorator, getDecoratorStringArgs(decorator));
        break;
      case 'ContentChildren':
        this.visitNgContentChildren(<ts.PropertyDeclaration>decorator.parent,
          decorator, getDecoratorStringArgs(decorator));
        break;
      case 'ViewChild':
        this.visitNgViewChild(<ts.PropertyDeclaration>decorator.parent,
          decorator, getDecoratorStringArgs(decorator));
        break;
      case 'ViewChildren':
        this.visitNgViewChildren(<ts.PropertyDeclaration>decorator.parent,
          decorator, getDecoratorStringArgs(decorator));
        break;
    }
  }

  protected visitClassDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);

    if (name === 'Injectable') {
      this.visitNgInjectable(<ts.ClassDeclaration>decorator.parent, decorator);
    }


    if (name === 'Pipe') {
      this.visitNgPipe(<ts.ClassDeclaration>decorator.parent, decorator);
    }

    // Not invoked @Component or @Pipe, or @Directive
    if (!(<ts.CallExpression>decorator.expression).arguments ||
      !(<ts.CallExpression>decorator.expression).arguments.length ||
      !(<ts.ObjectLiteralExpression>(<ts.CallExpression>decorator.expression).arguments[0]).properties) {
      return;
    }

  }

  protected visitNgComponent(metadata: ComponentMetadata) {
    const template = metadata.template;
    const getPosition = (node: any) => {
      let pos = 0;
      if (node) {
        pos = node.pos + 1;
        try {
          pos = node.getStart() + 1;
        } catch (e) {
        }
      }
      return pos;
    };
    if (template && template.template) {
      try {
        const templateAst = parseTemplate(template.template.code, Config.predefinedDirectives);
        this.visitNgTemplateHelper(templateAst, metadata, getPosition(template.node));
      } catch (e) {
        logger.error('Cannot parse the template of', ((<any>metadata.controller || {}).name || {}).text, e);
      }
    }
    const styles = metadata.styles;
    if (styles && styles.length) {
      for (let i = 0; i < styles.length; i += 1) {
        const style = styles[i];
        try {
          this.visitNgStyleHelper(parseCss(style.style.code), metadata, style, getPosition(style.node));
        } catch (e) {
          logger.error('Cannot parse the styles of', ((<any>metadata.controller || {}).name || {}).text, e);
        }
      }
    }
  }

  protected visitNgDirective(metadata: DirectiveMetadata) {
  }

  protected visitNgPipe(controller: ts.ClassDeclaration, decorator: ts.Decorator) {
  }

  protected visitNgInjectable(classDeclaration: ts.ClassDeclaration, decorator: ts.Decorator) {
  }

  protected visitNgInput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
  }

  protected visitNgOutput(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {
  }

  protected visitNgHostBinding(property: ts.PropertyDeclaration, decorator: ts.Decorator, args: string[]) {
  }

  protected visitNgHostListener(method: ts.MethodDeclaration, decorator: ts.Decorator, args: string[]) {
  }

  protected visitNgContentChild(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
  }

  protected visitNgContentChildren(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
  }

  protected visitNgViewChild(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
  }

  protected visitNgViewChildren(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
  }

  protected visitNgTemplateHelper(roots: compiler.TemplateAst[], context: ComponentMetadata, baseStart: number) {
    if (!roots || !roots.length) {
      return;
    } else {
      const sourceFile = this.getContextSourceFile(context.template.url, context.template.template.source);
      const referenceVisitor = new ReferenceCollectorVisitor();
      const visitor =
        new this._config.templateVisitorCtrl(
          sourceFile, this._originalOptions, context, baseStart, this._config.expressionVisitorCtrl);
      compiler.templateVisitAll(referenceVisitor, roots, null);
      visitor._variables = referenceVisitor.variables;
      roots.forEach(r => visitor.visit(r, context.controller));
      visitor.getFailures().forEach(f => this.addFailure(f));
    }
  }

  protected visitNgStyleHelper(style: CssAst, context: ComponentMetadata, styleMetadata: StyleMetadata, baseStart: number) {
    if (!style) {
      return;
    } else {
      const sourceFile = this.getContextSourceFile(styleMetadata.url, styleMetadata.style.source);
      const visitor = new this._config.cssVisitorCtrl(sourceFile, this._originalOptions, context, styleMetadata, baseStart);
      style.visit(visitor);
      visitor.getFailures().forEach(f => this.addFailure(f));
    }
  }

  protected getContextSourceFile(path: string, content: string) {
    const current = this.getSourceFile();
    if (!path) {
      return current;
    }
    const sf = ts.createSourceFile(path, `\`${content}\``, ts.ScriptTarget.ES5);
    const original = sf.getFullText;
    sf.getFullText = function() {
      const text = original.apply(sf);
      return text.substring(1, text.length - 1);
    }.bind(sf);
    return sf;
  }
}

