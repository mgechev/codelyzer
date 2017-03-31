import * as Lint from 'tslint';
import * as ts from 'typescript';
import {stringDistance} from './util/utils';
import {getDeclaredProperties, getDeclaredMethods} from './util/classDeclarationUtils';
import {Ng2Walker} from './angular/ng2Walker';
import {RecursiveAngularExpressionVisitor} from './angular/templates/recursiveAngularExpressionVisitor';
import * as e from '@angular/compiler/src/expression_parser/ast';
import { EmbeddedTemplateAst, ElementAst } from '@angular/compiler';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { Fix } from 'tslint';
import SyntaxKind = require('./util/syntaxKind');

const ErrorMessage = 'You should use <ng-template/> instead of <template/>';
const TemplateStart = '<template';
const TemplateEnd = '</template>';
const TemplateEndRe = /<\/template>/i;

const set = new Set<EmbeddedTemplateAst>();

class TemplateToNgTemplateVisitor extends BasicTemplateAstVisitor {
  private _prevClosing: number = 0;
  private _fix: Fix;
  private _visitedElements = new Set<EmbeddedTemplateAst>();

  visitEmbeddedTemplate(element: EmbeddedTemplateAst, ctx: any) {
    if (this._visitedElements.has(element)) {
      return;
    } else {
      this._visitedElements.add(element);
    }

    const sp = element.sourceSpan;
    const content = sp.start.file.content;
    const subtemplate = content.substring(sp.start.offset, sp.end.offset);

    if (subtemplate.startsWith(TemplateStart)) {
      const replacement = this.createReplacement(sp.start.offset, TemplateStart.length, '<ng-template');
      if (!this._fix) {
        this._fix = this.createFix(replacement);
      } else {
        this._fix.replacements.push(replacement);
      }
      this.addFailure(this.createFailure(sp.start.offset, sp.end.offset - sp.start.offset, ErrorMessage, this._fix));
    }

    super.visitEmbeddedTemplate(element, ctx);

    const subcontent = content.substring(this._prevClosing, content.length);
    const matches = TemplateEndRe.exec(subcontent);
    if (this._fix && matches && typeof matches.index === 'number') {
      this._fix.replacements.push(this.createReplacement(matches.index + this._prevClosing, TemplateEnd.length, '</ng-template>'));
      this._prevClosing = matches.index + this._prevClosing + TemplateEnd.length;
      const rest = content.substring(this._prevClosing, content.length);
      if (!TemplateEndRe.test(rest)) {
        this._fix = null;
        this._prevClosing = 0;
        this._visitedElements = new Set();
      }
    }
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'templates-use-public-rule',
    type: 'functionality',
    description: `Ensure that properties and methods accessed from the template are public.`,
    rationale: `When Angular compiles the templates, it has to access these propertes from outside the class.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };

  static FAILURE: string = 'The %s "%s" that you\'re trying to access does not exist in the class declaration.';

  public apply(sourceFile:ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new Ng2Walker(sourceFile,
            this.getOptions(), {
              templateVisitorCtrl: TemplateToNgTemplateVisitor
            }));
  }
}
