import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { EmbeddedTemplateAst } from '@angular/compiler';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

const ErrorMessage = 'You should use <ng-template> instead of <template>';
const TemplateStart = '<template';
const TemplateEnd = '</template>';
const TemplateEndRe = /<\s*\/\s*template\s*>/i;

class TemplateToNgTemplateVisitor extends BasicTemplateAstVisitor {
  private _prevClosing: number = 0;
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

    let fix;
    if (subtemplate.startsWith(TemplateStart)) {
      const replacement = this.createReplacement(sp.start.offset, TemplateStart.length, '<ng-template');
      this.addFailure(this.createFailure(sp.start.offset, sp.end.offset - sp.start.offset, ErrorMessage, replacement));
    }

    super.visitEmbeddedTemplate(element, ctx);

    const subcontent = content.substring(this._prevClosing, content.length);
    const matches = TemplateEndRe.exec(subcontent);
    if (fix && matches && typeof matches.index === 'number') {
      fix.replacements.push(this.createReplacement(matches.index + this._prevClosing, TemplateEnd.length, '</ng-template>'));
      this._prevClosing = matches.index + this._prevClosing + TemplateEnd.length;
      const rest = content.substring(this._prevClosing, content.length);
      if (!TemplateEndRe.test(rest)) {
        this._prevClosing = 0;
        this._visitedElements = new Set();
      }
    }
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'template-to-ng-template',
    type: 'functionality',
    description: `Ensure that <ng-template> is used instance of <template>.`,
    rationale: `Since Angular 4.0,  <template> is deprecated.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new NgWalker(sourceFile,
            this.getOptions(), {
              templateVisitorCtrl: TemplateToNgTemplateVisitor
            }));
  }
}
