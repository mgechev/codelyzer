import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { getComponentDecorator, isSimpleTemplateString, getDecoratorPropertyInitializer } from './util/utils';
import { BasicCssAstVisitor } from './angular/styles/basicCssAstVisitor';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { VERSION } from '@angular/core';
import {
  TemplateAst,
  ElementAst,
  EmbeddedTemplateAst,
  PropertyBindingType
} from '@angular/compiler';
import { parseTemplate } from './angular/templates/templateParser';
import { CssAst, CssSelectorRuleAst, CssSelectorAst, CssBlockAst } from './angular/styles/cssAst';

import { ComponentMetadata, StyleMetadata } from './angular/metadata';
import { ngWalkerFactoryUtils } from './angular/ngWalkerFactoryUtils';
import { logger } from './util/logger';
import { SemVerDSL } from './util/ngVersion';

const CssSelectorTokenizer = require('css-selector-tokenizer');

const getSymbolName = (t: any) => {
  let expr = t;
  if (t.expression) {
    expr = t.expression;
  }
  if (t.expression && t.expression.name) {
    expr = t.expression.name;
  }
  return expr.text;
};

const isEncapsulationEnabled = (encapsulation: any) => {
  if (!encapsulation) {
    return true;
  } else {
    // By default consider the encapsulation disabled
    if (getSymbolName(encapsulation) !== 'ViewEncapsulation') {
      return false;
    } else {
      const encapsulationType = encapsulation.name.text;
      if (/^(Emulated|Native)$/.test(encapsulationType)) {
        return true;
      }
    }
  }
  return false;
};

// Initialize the selector accessors
const lang = require('cssauron')({
  tag(node: ElementAst) {
    return (node.name || '').toLowerCase();
  },
  // We do not support it for now
  contents(node: ElementAst) { return ''; },
  id(node: ElementAst) {
    return this.attr(node, 'id');
  },
  'class'(node: ElementAst) {
    const classBindings = (node.inputs || [])
      .filter(b => b.type === PropertyBindingType.Class)
      .map(b => b.name).join(' ');
    const classAttr = node.attrs.filter(a => a.name.toLowerCase() === 'class').pop();
    let staticClasses = '';
    if (classAttr) {
      staticClasses = classAttr.value + ' ';
    }
    return staticClasses + classBindings;
  },
  parent(node: any) {
    return node.parentNode;
  },
  children(node: ElementAst) {
    return node.children;
  },
  attr(node: ElementAst, attr: string) {
    const targetAttr = node.attrs.filter(a => a.name === attr).pop();
    if (targetAttr) {
      return targetAttr.value;
    }
    return undefined;
  }
});

// Visitor which normalizes the elements and finds out if we have a match
class ElementVisitor extends BasicTemplateAstVisitor {
  visitElement(ast: ElementAst, fn: any) {
    fn(ast);
    ast.children.forEach(c => {
      if (c instanceof ElementAst) {
        (<any>c).parentNode = ast;
      }
      this.visit(c, fn);
    });
  }
}

// Finds out if selector of given type has been used
const hasSelector = (s: any, type: string) => {
  if (!s) {
    return false;
  }
  if (s.type === 'selector' || s.type === 'selectors') {
    return (s.nodes || []).some(n => hasSelector(n, type));
  } else {
    return s.type === type;
  }
};

const dynamicFilters = {
  id(ast: ElementAst, selector: any) {
    return (ast.inputs || []).some(i => i.name === 'id');
  },
  attribute(ast: ElementAst, selector: any) {
    return (ast.inputs || []).some(i => i.type === PropertyBindingType.Attribute);
  },
  'class'(ast: ElementAst, selector: any) {
    return (ast.inputs || []).some(i => i.name === 'className' || i.name === 'ngClass');
  }
};

// Filters elements following the strategies:
// - If has selector by id and any of the elements has a dynamically set id we just skip it.
// - If has selector by class and any of the elements has a dynamically set class we just skip it.
// - If has selector by attribute and any of the elements has a dynamically set attribute we just skip it.
class ElementFilterVisitor extends BasicTemplateAstVisitor {
  shouldVisit(ast: ElementAst, strategies: any, selectorTypes: any): boolean {
    return Object.keys(strategies).every(s => {
      const strategy = strategies[s];
      return !selectorTypes[s] || !strategy(ast);
    }) && (ast.children || [])
      .every(c => ast instanceof ElementAst && this.shouldVisit(<ElementAst>c, strategies, selectorTypes)
                  || ast instanceof EmbeddedTemplateAst &&
                  (ast.children || []).every(c => this.shouldVisit(<ElementAst>c, strategies, selectorTypes)));
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'no-unused-css',
    type: 'maintainability',
    description: 'Disallows having an unused CSS rule in the component\'s stylesheet.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
    hasFix: true
  };


  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new UnusedCssNgVisitor(sourceFile,
            this.getOptions(), {
              cssVisitorCtrl: UnusedCssVisitor
            }));
  }
}

class UnusedCssVisitor extends BasicCssAstVisitor {
  templateAst: TemplateAst;

  constructor(sourceFile: ts.SourceFile,
    originalOptions: Lint.IOptions,
    context: ComponentMetadata,
    protected style: StyleMetadata,
    templateStart: number) {
      super(sourceFile, originalOptions, context, style, templateStart);
    }

  visitCssSelectorRule(ast: CssSelectorRuleAst) {
    try {
      const match = ast.selectors.some(s => this.visitCssSelector(s));
      if (!match) {
        // We need this because of eventual source maps
        const start = ast.start.offset;
        const end = ast.end.offset;
        const length = end - ast.start.offset + 1;
        // length + 1 because we want to drop the '}'
        this.addFailure(this.createFailure(start, length, 'Unused styles', this.createReplacement(start, length, '')));
      }
    } catch (e) {
      logger.error(e);
    }
    return true;
  }

  visitCssSelector(ast: CssSelectorAst) {
    const parts = [];
    for (let i = 0; i < ast.selectorParts.length; i += 1) {
      const c = ast.selectorParts[i];
      c.strValue = c.strValue.split('::').shift();
      // Stop on /deep/ and >>>
      if (c.strValue.endsWith('/') ||
          c.strValue.endsWith('>')) {
        parts.push(c.strValue);
        break;
      } else if (!c.strValue.startsWith(':')) { // skip :host
        parts.push(c.strValue);
      }
    }
    if (!parts.length || !this.templateAst) {
      return true;
    }
    const strippedSelector = parts.map(s => s.replace(/\/|>$/, '').trim()).join(' ');
    const elementFilterVisitor = new ElementFilterVisitor(this.getSourceFile(), this._originalOptions, this.context, 0);
    const tokenized = CssSelectorTokenizer.parse(strippedSelector);
    const selectorTypesCache = Object.keys(dynamicFilters).reduce((a: any, key: string) => {
      a[key] = hasSelector(tokenized, key);
      return a;
    }, {});
    if (!elementFilterVisitor.shouldVisit(<ElementAst>this.templateAst, dynamicFilters, selectorTypesCache)) {
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
    visitor.visit(this.templateAst, selector);
    return matchFound;
  }
}

// Finds the template and wrapes the parsed content into a root element
export class UnusedCssNgVisitor extends NgWalker {
  private templateAst: TemplateAst;

  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    const d = getComponentDecorator(declaration);
    if (d) {
      const meta: ComponentMetadata = <ComponentMetadata>this._metadataReader.read(declaration);
      this.visitNgComponent(meta);
      if (meta.template && meta.template.template) {
        try {
          const ElementAstCtr = ElementAst as any;
          SemVerDSL
            .gte('4.0.0-beta.8', () => {
              this.templateAst =
                new ElementAstCtr('*', [], [], [], [], [], [], false, [], parseTemplate(meta.template.template.code), 0, null, null);
            })
            .else(() => {
              this.templateAst =
                new ElementAstCtr('*', [], [], [], [], [], [], false, parseTemplate(meta.template.template.code), 0, null, null);
            });
        } catch (e) {
          logger.error('Cannot parse the template', e);
        }
      }
    }
    super.visitClassDeclaration(declaration);
  }

  protected visitNgStyleHelper(style: CssAst, context: ComponentMetadata, styleMetadata: StyleMetadata, baseStart: number) {
    if (!style) {
      return;
    } else {
      const file = this.getContextSourceFile(styleMetadata.url, styleMetadata.style.source);
      const visitor = new UnusedCssVisitor(file, this._originalOptions, context, styleMetadata, baseStart);
      visitor.templateAst = this.templateAst;
      const d = getComponentDecorator(context.controller);
      const encapsulation = getDecoratorPropertyInitializer(d, 'encapsulation');
      if (isEncapsulationEnabled(encapsulation)) {
        style.visit(visitor);
        visitor.getFailures().forEach(f => this.addFailure(f));
      }
    }
  }
}
