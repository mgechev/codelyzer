import * as Lint from 'tslint';
import * as ts from 'typescript';
import {NgWalker} from './angular/ngWalker';
import * as ast from '@angular/compiler';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { ExpTypes } from './angular/expressionTypes';
import { Config } from './angular/config';

const InterpolationOpen = Config.interpolation[0];
const InterpolationClose = Config.interpolation[1];
const InterpolationNoWhitespaceRe = new RegExp(`${InterpolationOpen}\\S(.*?)\\S${InterpolationClose}`);
const InterpolationExtraWhitespaceRe =
  new RegExp(`${InterpolationOpen}\\s\\s(.*?)\\s${InterpolationClose}|${InterpolationOpen}\\s(.*?)\\s\\s${InterpolationClose}`);

const getReplacements = (text: ast.BoundTextAst, absolutePosition: number) => {
  const expr: string = (text.value as any).source;
  const internalStart = expr.indexOf(InterpolationOpen);
  const internalEnd = expr.lastIndexOf(InterpolationClose);
  const len = expr.trim().length - InterpolationOpen.length - InterpolationClose.length;
  const trimmed = expr.substr(internalStart + InterpolationOpen.length, len).trim();
  return [
    new Lint.Replacement(absolutePosition,
      internalEnd - internalStart + InterpolationClose.length,
      `${InterpolationOpen} ${trimmed} ${InterpolationClose}`)
  ];
};

class WhitespaceTemplateVisitor extends BasicTemplateAstVisitor {
  visitBoundText(text: ast.BoundTextAst, context: any): any {
    if (ExpTypes.ASTWithSource(text.value)) {
      // Note that will not be reliable for different interpolation symbols
      let error = null;
      const expr: any = (<any>text.value).source;
      if (InterpolationNoWhitespaceRe.test(expr)) {
        error = 'Missing whitespace in interpolation; expecting {{ expr }}';
      }
      if (InterpolationExtraWhitespaceRe.test(expr)) {
        error = 'Extra whitespace in interpolation; expecting {{ expr }}';
      }
      if (error) {
        const internalStart = expr.indexOf(InterpolationOpen);
        const start = text.sourceSpan.start.offset + internalStart;
        const absolutePosition = this.getSourcePosition(start);
        this.addFailure(
          this.createFailure(start,
            expr.trim().length,
            error, getReplacements(text, absolutePosition)));
      }
    }
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'angular-whitespace-rule',
    type: 'style',
    description: `Ensures the proper formatting of Angular expressions.`,
    rationale: `Having whitespace in the right places in an Angular expression makes the template more readable.`,
    optionsDescription: Lint.Utils.dedent`
      One argument may be optionally provided:
      * \`"check-interpolation"\` checks for whitespace before and after the interpolation characters`,
    options: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['check-interpolation'],
      },
      minLength: 0,
      maxLength: 1,
    },
    optionExamples: ['[true, "check-interpolation"]'],
    typescriptOnly: true,
  };

  static FAILURE: string = 'The %s "%s" that you\'re trying to access does not exist in the class declaration.';

  public apply(sourceFile:ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new NgWalker(sourceFile,
            this.getOptions(), {
              templateVisitorCtrl: WhitespaceTemplateVisitor,
            }));
  }
}
