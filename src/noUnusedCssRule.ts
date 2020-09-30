import { ElementAst, EmbeddedTemplateAst, PropertyBindingType, TemplateAst } from '@angular/compiler';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { ComponentMetadata, StyleMetadata } from './angular/metadata';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicCssAstVisitor } from './angular/styles/basicCssAstVisitor';
import { CssAst, CssSelectorAst, CssSelectorRuleAst } from './angular/styles/cssAst';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { parseTemplate } from './angular/templates/templateParser';
import { logger } from './util/logger';
import { SemVerDSL } from './util/ngVersion';
import { getComponentDecorator, getDecoratorPropertyInitializer, getSymbolName } from './util/utils';

interface Strategy {
  attribute(ast: ElementAst): boolean;
  class(ast: ElementAst): boolean;
  id(ast: ElementAst): boolean;
}

const CssSelectorTokenizer = require('css-selector-tokenizer');

const isEncapsulationEnabled = (encapsulation: any) => {
  if (!encapsulation) {
    return true;
  }

  // By default consider the encapsulation disabled
  if (getSymbolName(encapsulation) !== 'ViewEncapsulation') {
    return false;
  }

  const encapsulationType = encapsulation.name.text;

  return /^(Emulated|Native)$/.test(encapsulationType);
};

// Initialize the selector accessors
const lang = require('cssauron')({
  tag(node: ElementAst) {
    return (node.name || '').toLowerCase();
  },
  // We do not support it for now
  contents(node: ElementAst) {
    return '';
  },
  id(node: ElementAst) {
    return this.attr(node, 'id');
  },
  class(node: ElementAst) {
    const classBindings = (node.inputs || [])
      .filter((b) => b.type === PropertyBindingType.Class)
      .map((b) => b.name)
      .join(' ');
    const classAttr = node.attrs.find((a) => a.name.toLowerCase() === 'class');

    return classAttr ? `${classAttr.value} ${classBindings}` : classBindings;
  },
  parent(node: any) {
    return node.parentNode;
  },
  children(node: ElementAst) {
    return node.children;
  },
  attr(node: ElementAst, attr: string) {
    const targetAttr = node.attrs.find((a) => a.name === attr);

    return targetAttr ? targetAttr.value : undefined;
  },
});

// Visitor which normalizes the elements and finds out if we have a match
class ElementVisitor extends BasicTemplateAstVisitor {
  visitElement(ast: ElementAst, fn: any) {
    fn(ast);
    ast.children.forEach((c) => {
      if (c instanceof ElementAst) {
        (c as any).parentNode = ast;
      }
      this.visit!(c, fn);
    });
  }
}

// Finds out if selector of given type has been used
const hasSelector = (s: any, type: string) => {
  if (!s) {
    return false;
  }

  return s.type === 'selector' || s.type === 'selectors' ? (s.nodes || []).some((n) => hasSelector(n, type)) : s.type === type;
};

const dynamicFilters: Strategy = {
  id(ast: ElementAst) {
    return (ast.inputs || []).some((i) => i.name === 'id');
  },
  attribute(ast: ElementAst) {
    return (ast.inputs || []).some((i) => i.type === PropertyBindingType.Attribute);
  },
  class(ast: ElementAst) {
    return (ast.inputs || []).some((i) => i.name === 'className' || i.name === 'ngClass');
  },
};

// Filters elements following the strategies:
// - If has selector by id and any of the elements has a dynamically set id we just skip it.
// - If has selector by class and any of the elements has a dynamically set class we just skip it.
// - If has selector by attribute and any of the elements has a dynamically set attribute we just skip it.
class ElementFilterVisitor extends BasicTemplateAstVisitor {
  shouldVisit(ast: ElementAst, strategies: Strategy, selectorTypes: object): boolean {
    return (
      Object.keys(strategies).every((s) => {
        const strategy = strategies[s];
        return !selectorTypes[s] || !strategy(ast);
      }) &&
      (ast.children || []).every(
        (c) =>
          (ast instanceof ElementAst && this.shouldVisit(c as ElementAst, strategies, selectorTypes)) ||
          (ast instanceof EmbeddedTemplateAst &&
            (ast.children || []).every((c) => this.shouldVisit(c as ElementAst, strategies, selectorTypes)))
      )
    );
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    ruleName: 'no-unused-css',
    type: 'maintainability',
    description: "Disallows having an unused CSS rule in the component's stylesheet.",
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
    hasFix: true,
  };

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { cssVisitorCtrl: CssVisitorCtrl };
    const walker = new Walker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

class CssVisitorCtrl extends BasicCssAstVisitor {
  templateAst!: TemplateAst;

  constructor(
    sourceFile: ts.SourceFile,
    originalOptions: Lint.IOptions,
    context: ComponentMetadata,
    protected style: StyleMetadata,
    templateStart: number
  ) {
    super(sourceFile, originalOptions, context, style, templateStart);
  }

  visitCssSelectorRule(ast: CssSelectorRuleAst) {
    try {
      const match = ast.selectors.some((s) => this.visitCssSelector(s));
      if (!match) {
        // We need this because of eventual source maps
        const {
          end: { offset: endOffset },
          start: { offset: startOffset },
        } = ast;
        // length + 1 because we want to drop the '}'
        const length = endOffset - startOffset + 1;
        this.addFailureAt(startOffset, length, 'Unused styles', Lint.Replacement.deleteText(startOffset - 1, length + 1));
      }
    } catch (e) {
      logger.error(e);
    }
    return true;
  }

  visitCssSelector(ast: CssSelectorAst) {
    const parts: string[] = [];
    for (let i = 0; i < ast.selectorParts.length; i += 1) {
      const c = ast.selectorParts[i];
      c.strValue = c.strValue.split('::').shift()!;
      // Stop on /deep/ and >>>
      if (c.strValue.endsWith('/') || c.strValue.endsWith('>')) {
        parts.push(c.strValue);
        break;
      } else if (!c.strValue.startsWith(':')) {
        // skip :host
        parts.push(c.strValue);
      }
    }
    if (!parts.length || !this.templateAst) {
      return true;
    }
    const strippedSelector = parts.map((s) => s.replace(/\/|>$/, '').trim()).join(' ');
    const elementFilterVisitor = new ElementFilterVisitor(this.getSourceFile(), this._originalOptions, this.context, 0);
    const tokenized = CssSelectorTokenizer.parse(strippedSelector);
    const selectorTypesCache = Object.keys(dynamicFilters).reduce((a, key) => {
      a[key] = hasSelector(tokenized, key);
      return a;
    }, {});

    if (!elementFilterVisitor.shouldVisit(this.templateAst as ElementAst, dynamicFilters, selectorTypesCache)) {
      return true;
    }

    let matchFound = false;
    const selector = (element: ElementAst) => {
      if (lang(strippedSelector)(element)) {
        matchFound = true;
        return true;
      }
      return false;
    };
    const visitor = new ElementVisitor(this.getSourceFile(), this._originalOptions, this.context, 0);
    visitor.visit!(this.templateAst, selector);
    return matchFound;
  }
}

// Finds the template and wrapes the parsed content into a root element
class Walker extends NgWalker {
  private templateAst!: TemplateAst;

  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    const d = getComponentDecorator(declaration);
    if (d) {
      const meta = <ComponentMetadata>this._metadataReader!.read(declaration);
      this.visitNgComponent(meta);
      if (meta.template && meta.template.template) {
        try {
          const ElementAstCtr = ElementAst as any;
          SemVerDSL.gte('4.0.0-beta.8', () => {
            this.templateAst = new ElementAstCtr(
              '*',
              [],
              [],
              [],
              [],
              [],
              [],
              false,
              [],
              parseTemplate(meta.template!.template.code),
              0,
              null,
              null
            );
          }).else(() => {
            this.templateAst = new ElementAstCtr(
              '*',
              [],
              [],
              [],
              [],
              [],
              [],
              false,
              parseTemplate(meta.template!.template.code),
              0,
              null,
              null
            );
          });
        } catch (e) {
          logger.error('Cannot parse the template', e);
        }
      }
    }
    super.visitClassDeclaration(declaration);
  }

  protected visitNgStyleHelper(style: CssAst, context: ComponentMetadata, styleMetadata: StyleMetadata, baseStart: number) {
    this.validateStyles(style, context, styleMetadata, baseStart);
    super.visitNgStyleHelper(style, context, styleMetadata, baseStart);
  }

  private validateStyles(style: CssAst, context: ComponentMetadata, styleMetadata: StyleMetadata, baseStart: number) {
    if (!style) {
      return;
    }

    const file = this.getContextSourceFile(styleMetadata.url!, styleMetadata.style.source!);
    const visitor = new CssVisitorCtrl(file, this._originalOptions, context, styleMetadata, baseStart);
    visitor.templateAst = this.templateAst;
    const d = getComponentDecorator(context.controller)!;
    const encapsulation = getDecoratorPropertyInitializer(d, 'encapsulation');
    if (isEncapsulationEnabled(encapsulation)) {
      style.visit(visitor);
      // tslint:disable-next-line:deprecation
      visitor.getFailures().forEach((f) => this.addFailure(f));
    }
  }
}
