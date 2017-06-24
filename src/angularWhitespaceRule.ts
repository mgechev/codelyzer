import * as Lint from 'tslint';
import * as ts from 'typescript';
import {NgWalker} from './angular/ngWalker';
import * as ast from '@angular/compiler';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { ExpTypes } from './angular/expressionTypes';
import { Config } from './angular/config';
import { RecursiveAngularExpressionVisitor } from './angular/templates/recursiveAngularExpressionVisitor';

const InterpolationOpen = Config.interpolation[0];
const InterpolationClose = Config.interpolation[1];
const InterpolationNoWhitespaceRe =new RegExp(`${InterpolationOpen}\\S(.*?)\\S${InterpolationClose}|${InterpolationOpen}\\s(.*?)\\S${InterpolationClose}|${InterpolationOpen}\\S(.*?)\\s${InterpolationClose}`);
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

type Option = 'check-interpolation' | 'check-pipe';

interface ConfigurableVisitor {
  getOption(): Option;
}

/* Inrerpolation visitors */

class InterpolationWhitespaceVisitor extends BasicTemplateAstVisitor implements ConfigurableVisitor {
  visitBoundText(text: ast.BoundTextAst, context: BasicTemplateAstVisitor): any {
    if (ExpTypes.ASTWithSource(text.value)) {
      // Note that will not be reliable for different interpolation symbols
      let error = null;
      const expr: any = (<any>text.value).source;
      if (InterpolationNoWhitespaceRe.test(expr)) {
        error = `Missing whitespace in interpolation; expecting ${InterpolationOpen} expr ${InterpolationClose}`;
      }
      if (InterpolationExtraWhitespaceRe.test(expr)) {
        error = `Extra whitespace in interpolation; expecting ${InterpolationOpen} expr ${InterpolationClose}`;
      }
      if (error) {
        const internalStart = expr.indexOf(InterpolationOpen);
        const start = text.sourceSpan.start.offset + internalStart;
        const absolutePosition = context.getSourcePosition(start);
        return context.addFailure(
          context.createFailure(start,
            expr.trim().length,
            error, getReplacements(text, absolutePosition)));
      }
    }
    super.visitBoundText(text, context);
    return null;
  }

  getOption(): Option {
    return 'check-interpolation';
  }
}

class WhitespaceTemplateVisitor extends BasicTemplateAstVisitor {
  private visitors: (BasicTemplateAstVisitor & ConfigurableVisitor)[] = [
    new InterpolationWhitespaceVisitor(this.getSourceFile(), this.getOptions(), this.context, this.templateStart)
  ];

  visitBoundText(text: ast.BoundTextAst, context: any): any {
    const options = this.getOptions();
    this.visitors
      .filter(v => options.indexOf(v.getOption()) >= 0)
      .map(v => v.visitBoundText(text, this))
      .filter(f => !!f)
      .forEach(f => this.addFailure(f));
    super.visitBoundText(text, context);
  }
}

/* Expression visitors */

class PipeWhitespaceVisitor extends RecursiveAngularExpressionVisitor implements ConfigurableVisitor {
  visitPipe(ast: ast.BindingPipe, context: RecursiveAngularExpressionVisitor): any {
    const start = ast.span.start;
    const exprStart = context.getSourcePosition(ast.exp.span.start);
    const exprEnd = context.getSourcePosition(ast.exp.span.end);
    const sf = context.getSourceFile().getFullText();
    const exprText = sf.substring(exprStart, exprEnd);

    const replacements = [];
    // Handling the right side of the pipe
    let leftBeginning = exprEnd + 1; // exprEnd === '|'
    if (sf[leftBeginning] === ' ') {
      let ignoreSpace = 1;
      while (sf[leftBeginning + ignoreSpace] === ' ') {
        ignoreSpace += 1;
      }
      if (ignoreSpace > 1) {
        replacements.push(new Lint.Replacement(exprEnd + 1, ignoreSpace, ' '));
      }
    } else {
      replacements.push(new Lint.Replacement(exprEnd + 1, 0, ' '));
    }

    // Handling the left side of the pipe
    if (exprText[exprText.length - 1] === ' ') {
      let ignoreSpace = 1;
      while (exprText[exprText.length - 1 - ignoreSpace] === ' ') {
        ignoreSpace += 1;
      }
      if (ignoreSpace > 1) {
        replacements.push(new Lint.Replacement(exprEnd - ignoreSpace, ignoreSpace, ' '));
      }
    } else {
      replacements.push(new Lint.Replacement(exprEnd, 0, ' '));
    }

    if (replacements.length) {
      context.addFailure(
        context.createFailure(ast.exp.span.end - 1, 3,
        'The pipe operator should be surrounded by one space on each side, i.e. " | ".',
        replacements)
      );
    }
    super.visitPipe(ast, context);
    return null;
  }

  protected isAsyncBinding(expr: any) {
    return expr instanceof ast.BindingPipe && expr.name === 'async';
  }

  getOption(): Option {
    return 'check-pipe';
  }
}


class TemplateExpressionVisitor extends RecursiveAngularExpressionVisitor {
  private visitors: (RecursiveAngularExpressionVisitor & ConfigurableVisitor)[] = [
    new PipeWhitespaceVisitor(this.getSourceFile(), this.getOptions(), this.context, this.basePosition)
  ];

  visitPipe(expr: ast.BindingPipe, context: any): any {
    const options = this.getOptions();
    this.visitors
      .filter(v => options.indexOf(v.getOption()) >= 0)
      .map(v => v.visitPipe(expr, this))
      .filter(f => !!f)
      .forEach(f => this.addFailure(f));
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'angular-whitespace',
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

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new NgWalker(sourceFile,
            this.getOptions(), {
              templateVisitorCtrl: WhitespaceTemplateVisitor,
              expressionVisitorCtrl: TemplateExpressionVisitor
            }));
  }
}
