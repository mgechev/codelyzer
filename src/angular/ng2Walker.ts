import * as Lint from 'tslint';
import * as ts from 'typescript';
import * as compiler from '@angular/compiler';
import { parseTemplate } from './templates/templateParser';

import {parseCss} from './styles/parseCss';
import {CssAst} from './styles/cssAst';
import {BasicCssAstVisitor, CssAstVisitorCtrl} from './styles/basicCssAstVisitor';

import {RecursiveAngularExpressionVisitorCtr, BasicTemplateAstVisitor, TemplateAstVisitorCtr} from './templates/basicTemplateAstVisitor';
import {RecursiveAngularExpressionVisitor} from './templates/recursiveAngularExpressionVisitor';
import {ReferenceVisitor} from './templates/referenceVisitor';

import {MetadataReader} from './metadataReader';
import {ComponentMetadata, DirectiveMetadata, StyleMetadata} from './metadata';
import {ng2WalkerFactoryUtils} from './ng2WalkerFactoryUtils';

import {Config} from './config';

import {logger} from '../util/logger';
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
    private _config?: Ng2WalkerConfig,
    protected _metadataReader?: MetadataReader) {
    super(sourceFile, _originalOptions);
    this._metadataReader = this._metadataReader || ng2WalkerFactoryUtils.defaultMetadataReader();
    this._config = Object.assign({
      templateVisitorCtrl: BasicTemplateAstVisitor,
      expressionVisitorCtrl: RecursiveAngularExpressionVisitor,
      cssVisitorCtrl: BasicCssAstVisitor
    }, this._config || {});

    this._config = Object.assign({
      templateVisitorCtrl: BasicTemplateAstVisitor,
      expressionVisitorCtrl: RecursiveAngularExpressionVisitor,
      cssVisitorCtrl: BasicCssAstVisitor
    }, this._config || {});
    // this._config = ng2WalkerFactoryUtils.normalizeConfig(this._config);
  }

  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    const metadata = this._metadataReader.read(declaration);
    if (metadata instanceof ComponentMetadata) {
      this.visitNg2Component(metadata);
    } else if (metadata instanceof DirectiveMetadata) {
      this.visitNg2Directive(metadata);
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

    if (name === 'Pipe') {
      this.visitNg2Pipe(<ts.ClassDeclaration>decorator.parent, decorator);
    }
  }

  protected visitNg2Component(metadata: ComponentMetadata) {
    const template = metadata.template;
    const getPosition = (node: any) => {
      let pos = 0;
      if (node) {
        pos = node.pos + 1;
        try {
          pos = node.getStart() + 1;
        } catch (e) {}
      }
      return pos;
    };
    if (template && template.template) {
      try {
        const templateAst = parseTemplate(template.template.code, Config.predefinedDirectives);
        this.visitNg2TemplateHelper(templateAst, metadata, getPosition(template.node));
      } catch (e) {
        logger.error('Cannot parse the template of', ((<any>metadata.controller || {}).name || {}).text);
      }
    }
    const styles = metadata.styles;
    if (styles && styles.length) {
      for (let i = 0; i < styles.length; i += 1) {
        const style = styles[i];
        try {
          this.visitNg2StyleHelper(parseCss(style.style.code), metadata, style, getPosition(style.node));
        } catch (e) {
          logger.error('Cannot parse the styles of', ((<any>metadata.controller || {}).name || {}).text);
        }
      }
    }
  }

  protected visitNg2Directive(metadata: DirectiveMetadata) {}

  protected visitNg2Pipe(controller: ts.ClassDeclaration, decorator: ts.Decorator) {}

  protected visitNg2Input(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {}

  protected visitNg2Output(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {}

  protected visitNg2HostBinding(property: ts.PropertyDeclaration, decorator: ts.Decorator, args: string[]) {}

  protected visitNg2HostListener(method: ts.MethodDeclaration, decorator: ts.Decorator, args: string[]) {}

  protected visitNg2TemplateHelper(roots: compiler.TemplateAst[], context: ComponentMetadata, baseStart: number) {
    if (!roots || !roots.length) {
      return;
    } else {
      const sourceFile = this.getContextSourceFile(context.template.url, context.template.template.source);
      const referenceVisitor = new ReferenceVisitor();
      const visitor =
        new this._config.templateVisitorCtrl(
          sourceFile, this._originalOptions, context, baseStart, this._config.expressionVisitorCtrl);
      compiler.templateVisitAll(referenceVisitor, roots, null);
      visitor._variables = referenceVisitor.variables;
      compiler.templateVisitAll(visitor, roots, context.controller);
      visitor.getFailures().forEach(f => this.addFailure(f));
    }
  }

  protected visitNg2StyleHelper(style: CssAst, context: ComponentMetadata, styleMetadata: StyleMetadata, baseStart: number) {
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
    return ts.createSourceFile(path, `\`${content}\``, ts.ScriptTarget.ES5);
  }
}

