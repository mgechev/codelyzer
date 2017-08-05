import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';
import * as ast from '@angular/compiler';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { ExpTypes } from './angular/expressionTypes';
import { Config } from './angular/config';
import { RecursiveAngularExpressionVisitor } from './angular/templates/recursiveAngularExpressionVisitor';

const InterpolationOpen = Config.interpolation[0];
const InterpolationClose = Config.interpolation[1];
const InterpolationNoWhitespaceRe = new RegExp(`${InterpolationOpen}\\S(.*?)\\S${InterpolationClose}|${InterpolationOpen}` +
  `\\s(.*?)\\S${InterpolationClose}|${InterpolationOpen}\\S(.*?)\\s${InterpolationClose}`, 'g');
const InterpolationExtraWhitespaceRe =
  new RegExp(`${InterpolationOpen}\\s\\s(.*?)\\s${InterpolationClose}|${InterpolationOpen}\\s(.*?)\\s\\s${InterpolationClose}`, 'g');
const SemicolonNoWhitespaceNotInSimpleQuoteRe = new RegExp(/;\S(?![^']*')/);
const SemicolonNoWhitespaceNotInDoubleQuoteRe = new RegExp(/;\S(?![^"]*")/);


const getSemicolonReplacements = (text: ast.BoundDirectivePropertyAst, absolutePosition: number) => {

  return [
    new Lint.Replacement(absolutePosition, 1, '; ')
  ];

};

type Option = 'check-interpolation' | 'check-pipe' | 'check-semicolon';

interface ConfigurableVisitor {
  getOption(): Option;
}

/* Interpolation visitors */

class InterpolationWhitespaceVisitor extends BasicTemplateAstVisitor implements ConfigurableVisitor {
  visitBoundText(text: ast.BoundTextAst, context: BasicTemplateAstVisitor): any {
    if (ExpTypes.ASTWithSource(text.value)) {
      // Note that will not be reliable for different interpolation symbols
      let error = null;
      const expr: any = (<any>text.value).source;
      const applyRegex = (regex: RegExp, failure: string) => {
        let match: RegExpExecArray | null;
        while (match = regex.exec(expr)) {
          const start = text.sourceSpan.start.offset + match.index;
          const absolutePosition = context.getSourcePosition(start);
          const length = match[0].length;
          context.addFailure(
            context.createFailure(
            start, length, failure, [
            new Lint.Replacement(
              absolutePosition,
              length,
              `${InterpolationOpen} ${match[0].replace(InterpolationOpen, '').replace(InterpolationClose, '').trim()} ${InterpolationClose}`
            )
          ]));
        }
      };
      InterpolationNoWhitespaceRe.lastIndex = 0;
      applyRegex(
        InterpolationNoWhitespaceRe,
        `Missing whitespace in interpolation; expecting ${InterpolationOpen} expr ${InterpolationClose}`
      );
      InterpolationExtraWhitespaceRe.lastIndex = 0;
      applyRegex(
        InterpolationExtraWhitespaceRe,
        `Extra whitespace in interpolation; expecting ${InterpolationOpen} expr ${InterpolationClose}`
      );
    }
    super.visitBoundText(text, context);
    return null;
  }

  getOption(): Option {
    return 'check-interpolation';
  }
}

class SemicolonTemplateVisitor extends BasicTemplateAstVisitor implements ConfigurableVisitor {

  visitDirectiveProperty(prop: ast.BoundDirectivePropertyAst, context: BasicTemplateAstVisitor): any {


    if (prop.sourceSpan) {
      const directive = (<any>prop.sourceSpan).toString();
      const rawExpression = directive.split('=')[1].trim();
      const expr = rawExpression.substring(1, rawExpression.length - 1).trim();

      const doubleQuote = rawExpression.substring(0, 1).indexOf('\"') === 0;

      // Note that will not be reliable for different interpolation symbols
      let error = null;

      if (doubleQuote && SemicolonNoWhitespaceNotInSimpleQuoteRe.test(expr)) {
        error = 'Missing whitespace after semicolon; expecting \'; expr\'';
        const internalStart = expr.search(SemicolonNoWhitespaceNotInSimpleQuoteRe) + 1;
        const start = prop.sourceSpan.start.offset + internalStart + directive.length - directive.split('=')[1].trim().length + 1;
        const absolutePosition = context.getSourcePosition(start - 1);
        return context.addFailure(context.createFailure(start, 2,
          error, getSemicolonReplacements(prop, absolutePosition))
        );
      } else if (!doubleQuote && SemicolonNoWhitespaceNotInDoubleQuoteRe.test(expr)) {
        error = 'Missing whitespace after semicolon; expecting \'; expr\'';
        const internalStart = expr.search(SemicolonNoWhitespaceNotInDoubleQuoteRe) + 1;
        const start = prop.sourceSpan.start.offset + internalStart + directive.length - directive.split('=')[1].trim().length + 1;
        const absolutePosition = context.getSourcePosition(start - 1);
        return context.addFailure(context.createFailure(start, 2,
          error, getSemicolonReplacements(prop, absolutePosition))
        );
      }
    }
  }

  getOption(): Option {
    return 'check-semicolon';
  }

}


class WhitespaceTemplateVisitor extends BasicTemplateAstVisitor {
  private visitors: (BasicTemplateAstVisitor & ConfigurableVisitor)[] = [
    new InterpolationWhitespaceVisitor(this.getSourceFile(), this.getOptions(), this.context, this.templateStart),
    new SemicolonTemplateVisitor(this.getSourceFile(), this.getOptions(), this.context, this.templateStart)
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

  visitDirectiveProperty(prop: ast.BoundDirectivePropertyAst, context: any): any {
    const options = this.getOptions();
    this.visitors
      .filter(v => options.indexOf(v.getOption()) >= 0)
      .map(v => v.visitDirectiveProperty(prop, this))
      .filter(f => !!f)
      .forEach(f => this.addFailure(f));
    super.visitDirectiveProperty(prop, context);
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

  getOption(): Option {
    return 'check-pipe';
  }

  protected isAsyncBinding(expr: any) {
    return expr instanceof ast.BindingPipe && expr.name === 'async';
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
      Arguments may be optionally provided:
      * \`"check-interpolation"\` checks for whitespace before and after the interpolation characters
      * \`"check-pipe"\` checks for whitespace before and after a pipe
      * \`"check-semicolon"\` checks for whitespace after semicolon`,

    options: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['check-interpolation', 'check-pipe', 'check-semicolon'],
      },
      minLength: 0,
      maxLength: 3,
    },
    optionExamples: ['[true, "check-interpolation"]'],
    typescriptOnly: true,
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile,
        this.getOptions(), {
          templateVisitorCtrl: WhitespaceTemplateVisitor,
          expressionVisitorCtrl: TemplateExpressionVisitor,
        }));
  }
}
