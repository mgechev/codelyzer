import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {Ng2Walker} from './angular/ng2Walker';
import {getDecoratorName, isSimpleTemplateString, getDecoratorPropertyInitializer} from './util/utils';
import {BasicCssAstVisitor} from './angular/styles/basicCssAstVisitor';
import {BasicTemplateAstVisitor} from './angular/templates/basicTemplateAstVisitor';
import {
  TemplateAst,
  ElementAst
} from '@angular/compiler';
import {parseTemplate} from './angular/templates/templateParser';
import {CssAst, CssSelectorAst} from './angular/styles/cssAst';

const lang = require('cssauron')({
  tag(node: ElementAst) {
    return (node.name || '').toLowerCase();
  },
  // We do not support it for now
  contents(node: ElementAst) { return ''; },
  id(node: ElementAst) {
    return node.attrs.filter(a => a.name.toLowerCase() === 'id').pop().value;
  },
  // Will get more complicated with ngClass and [class.foo]
  'class'(node: ElementAst) {
    return node.attrs.filter(a => a.name.toLowerCase() === 'class').pop().value;
  },
  parent(node: any) {
    return node.parentNode;
  },
  children(node: ElementAst) {
    return node.children;
  },
  attr(node: ElementAst, attr: string) {
    return node.attrs.filter(a => a.name === attr).pop().value;
  }
});

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

export class Rule extends Lint.Rules.AbstractRule {
  static FAILURE: string = 'The %s "%s" that you\'re trying to access does not exist in the class declaration.';

  public apply(sourceFile:ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new UnusedCssNg2Visitor(sourceFile,
            this.getOptions(), {
              cssVisitorCtrl: UnusedCssVisitor
            }));
  }
}

class UnusedCssVisitor extends BasicCssAstVisitor {
  templateAst: TemplateAst;
  visitCssSelector(ast: CssSelectorAst) {
    const parts = [];
    for (let i = 0; i < ast.selectorParts.length; i += 1) {
      const c = ast.selectorParts[i];
      if (c.strValue.indexOf('::') >= 0) {
        break;
      }
      parts.push(c.strValue);
    }
    const strippedSelector = parts.map(s => s.replace(/\/|>$/, '').trim()).join(' ');
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
    if (!matchFound) {
      this.addFailure(this.createFailure(this.templateStart + ast.start.offset,
        strippedSelector.length, 'Unused style'));
    }
  }
}

export class UnusedCssNg2Visitor extends Ng2Walker {
  private templateAst: TemplateAst;

  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    (<ts.Decorator[]>declaration.decorators || [])
      .forEach((d: any) => {
        if (!(<ts.CallExpression>d.expression).arguments ||
            !(<ts.CallExpression>d.expression).arguments.length ||
            !(<ts.ObjectLiteralExpression>(<ts.CallExpression>d.expression).arguments[0]).properties) {
          return;
        }
        const name = getDecoratorName(d);
        if (name === 'Component') {
          this.visitNg2Component(<ts.ClassDeclaration>d.parent, d);
          const inlineTemplate = getDecoratorPropertyInitializer(d, 'template');
          if (inlineTemplate) {
            try {
              if (isSimpleTemplateString(inlineTemplate)) {
                this.templateAst =
                  new ElementAst('*', [], [], [], [], [], [], false, parseTemplate(inlineTemplate.text), 0, null, null);
              }
            } catch (e) {
              console.error('Cannot parse the template', e);
            }
          }
        }
      });
      super.visitClassDeclaration(declaration);
  }

  protected visitNg2StyleHelper(style: CssAst, context: ts.ClassDeclaration, baseStart: number) {
    if (!style) {
      return;
    } else {
      const visitor = new UnusedCssVisitor(this.getSourceFile(), this._originalOptions, context, baseStart);
      visitor.templateAst = this.templateAst;
      style.visit(visitor);
      visitor.getFailures().forEach(f => this.addFailure(f));
    }
  }
}
