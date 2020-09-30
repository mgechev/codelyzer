import * as compiler from '@angular/compiler';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { logger } from '../util/logger';
import { getClassName, getDecoratorName, maybeNodeArray } from '../util/utils';
import { Config } from './config';
import { ComponentMetadata, DirectiveMetadata, InjectableMetadata, ModuleMetadata, PipeMetadata, StyleMetadata } from './metadata';
import { MetadataReader } from './metadataReader';
import { ngWalkerFactoryUtils } from './ngWalkerFactoryUtils';
import { BasicCssAstVisitor, CssAstVisitorCtrl } from './styles/basicCssAstVisitor';
import { CssAst } from './styles/cssAst';
import { parseCss } from './styles/parseCss';
import { BasicTemplateAstVisitor, RecursiveAngularExpressionVisitorCtr, TemplateAstVisitorCtr } from './templates/basicTemplateAstVisitor';
import { RecursiveAngularExpressionVisitor } from './templates/recursiveAngularExpressionVisitor';
import { ReferenceCollectorVisitor } from './templates/referenceCollectorVisitor';
import { parseTemplate } from './templates/templateParser';

const getDecoratorStringArgs = (decorator: ts.Decorator): string[] => {
  const { expression } = decorator;
  const args = ts.isCallExpression(expression) ? expression.arguments : ts.createNodeArray();

  return args.filter(ts.isStringLiteral).map((x) => x.text);
};

const getPosition = (node: ts.Node) => {
  let pos = 0;
  if (node) {
    pos = node.pos + 1;
    try {
      pos = node.getStart() + 1;
    } catch {}
  }
  return pos;
};

export interface NgWalkerConfig {
  cssVisitorCtrl?: CssAstVisitorCtrl;
  expressionVisitorCtrl?: RecursiveAngularExpressionVisitorCtr;
  templateVisitorCtrl?: TemplateAstVisitorCtr;
}

// tslint:disable-next-line: deprecation
export class NgWalker extends Lint.RuleWalker {
  constructor(
    sourceFile: ts.SourceFile,
    protected _originalOptions: Lint.IOptions,
    private _config?: NgWalkerConfig,
    protected _metadataReader?: MetadataReader
  ) {
    super(sourceFile, _originalOptions);

    this._metadataReader = this._metadataReader || ngWalkerFactoryUtils.defaultMetadataReader();
    this._config = Object.assign(
      {
        cssVisitorCtrl: BasicCssAstVisitor,
        templateVisitorCtrl: BasicTemplateAstVisitor,
        expressionVisitorCtrl: RecursiveAngularExpressionVisitor,
      },
      this._config || {}
    );
  }

  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    if (this.hasClassName(declaration)) {
      const metadata = this._metadataReader!.read(declaration);
      if (metadata instanceof ComponentMetadata) {
        this.visitNgComponent(metadata);
      } else if (metadata instanceof DirectiveMetadata) {
        this.visitNgDirective(metadata);
      } else if (metadata instanceof PipeMetadata) {
        this.visitNgPipe(metadata);
      } else if (metadata instanceof ModuleMetadata) {
        this.visitNgModule(metadata);
      } else if (metadata instanceof InjectableMetadata) {
        this.visitNgInjectable(metadata);
      }
    }
    maybeNodeArray(ts.createNodeArray(declaration.decorators)).forEach(this.visitClassDecorator.bind(this));
    super.visitClassDeclaration(declaration);
  }

  visitMethodDeclaration(method: ts.MethodDeclaration) {
    maybeNodeArray(ts.createNodeArray(method.decorators)).forEach(this.visitMethodDecorator.bind(this));
    super.visitMethodDeclaration(method);
  }

  visitPropertyDeclaration(prop: ts.PropertyDeclaration) {
    maybeNodeArray(ts.createNodeArray(prop.decorators)).forEach(this.visitPropertyDecorator.bind(this));
    super.visitPropertyDeclaration(prop);
  }

  protected visitMethodDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);
    if (name === 'HostListener') {
      this.visitNgHostListener(decorator.parent as ts.MethodDeclaration, decorator, getDecoratorStringArgs(decorator));
    }
  }

  protected visitPropertyDecorator(decorator: ts.Decorator) {
    let name = getDecoratorName(decorator);
    switch (name) {
      case 'Input':
        this.visitNgInput(decorator.parent as ts.PropertyDeclaration, decorator, getDecoratorStringArgs(decorator));
        break;
      case 'Output':
        this.visitNgOutput(decorator.parent as ts.PropertyDeclaration, decorator, getDecoratorStringArgs(decorator));
        break;
      case 'HostBinding':
        this.visitNgHostBinding(decorator.parent as ts.PropertyDeclaration, decorator, getDecoratorStringArgs(decorator));
        break;
      case 'ContentChild':
        this.visitNgContentChild(decorator.parent as ts.PropertyDeclaration, decorator, getDecoratorStringArgs(decorator));
        break;
      case 'ContentChildren':
        this.visitNgContentChildren(decorator.parent as ts.PropertyDeclaration, decorator, getDecoratorStringArgs(decorator));
        break;
      case 'ViewChild':
        this.visitNgViewChild(decorator.parent as ts.PropertyDeclaration, decorator, getDecoratorStringArgs(decorator));
        break;
      case 'ViewChildren':
        this.visitNgViewChildren(decorator.parent as ts.PropertyDeclaration, decorator, getDecoratorStringArgs(decorator));
        break;
    }
  }

  protected visitNgComponent(metadata: ComponentMetadata) {
    const { styles = [] } = metadata;

    for (const style of styles) {
      try {
        const cssAst = parseCss(style!.style.code);
        this.visitNgStyleHelper(cssAst, metadata, style!, getPosition(style!.node!));
      } catch (e) {
        const {
          controller: { name },
        } = metadata;
        const text = name && ts.isIdentifier(name) ? name.text : '';

        logger.error('Cannot parse the styles of', text, e);
      }
    }

    const { template } = metadata;

    if (template && template.template) {
      try {
        const templateAst = parseTemplate(template.template.code, Config.predefinedDirectives);
        this.visitNgTemplateHelper(templateAst, metadata, getPosition(template.node!));
      } catch (e) {
        const {
          controller: { name },
        } = metadata;
        const text = name && ts.isIdentifier(name) ? name.text : '';

        logger.error('Cannot parse the template of', text, e);
      }
    }
  }

  protected visitClassDecorator(decorator: ts.Decorator) {}

  protected visitNgModule(metadata: ModuleMetadata) {}

  protected visitNgDirective(metadata: DirectiveMetadata) {}

  protected visitNgPipe(metadata: PipeMetadata) {}

  protected visitNgInjectable(metadata: InjectableMetadata) {}

  protected visitNgInput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {}

  protected visitNgOutput(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {}

  protected visitNgHostBinding(property: ts.PropertyDeclaration, decorator: ts.Decorator, args: string[]) {}

  protected visitNgHostListener(method: ts.MethodDeclaration, decorator: ts.Decorator, args: string[]) {}

  protected visitNgContentChild(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {}

  protected visitNgContentChildren(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {}

  protected visitNgViewChild(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {}

  protected visitNgViewChildren(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {}

  protected visitNgTemplateHelper(roots: compiler.TemplateAst[], context: ComponentMetadata, baseStart: number) {
    if (!roots || !roots.length) {
      return;
    }

    const sourceFile = this.getContextSourceFile(context.template!.url!, context.template!.template.source!);
    const referenceVisitor = new ReferenceCollectorVisitor();
    const visitor = new this._config!.templateVisitorCtrl!(
      sourceFile,
      this._originalOptions,
      context,
      baseStart,
      this._config!.expressionVisitorCtrl!
    );
    compiler.templateVisitAll(referenceVisitor, roots, null);
    visitor._variables = referenceVisitor.variables;
    roots.forEach((r) => visitor.visit(r, context.controller));
    // tslint:disable-next-line:deprecation
    visitor.getFailures().forEach((f) => this.addFailure(f));
  }

  protected visitNgStyleHelper(style: CssAst, context: ComponentMetadata, styleMetadata: StyleMetadata, baseStart: number) {
    if (!style) {
      return;
    }

    const sourceFile = this.getContextSourceFile(styleMetadata.url!, styleMetadata.style.source!);
    const visitor = new this._config!.cssVisitorCtrl!(sourceFile, this._originalOptions, context, styleMetadata, baseStart);
    style.visit(visitor);
    // tslint:disable-next-line:deprecation
    visitor.getFailures().forEach((f) => this.addFailure(f));
  }

  protected getContextSourceFile(path: string, content: string) {
    if (!path) {
      return this.getSourceFile();
    }

    const sf = ts.createSourceFile(path, `\`${content}\``, ts.ScriptTarget.ES5);
    const original = sf.getFullText;

    sf.getFullText = () => {
      const text = original.apply(sf);
      return text.substring(1, text.length - 1);
    };

    return sf;
  }

  private hasClassName(node: ts.Decorator | ts.ClassDeclaration) {
    return (ts.isDecorator(node) && getClassName(node.parent)) || (ts.isClassDeclaration(node) && getClassName(node));
  }
}
