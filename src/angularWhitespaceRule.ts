import * as Lint from 'tslint';
import * as ts from 'typescript';
import {stringDistance} from './util/utils';
import {getDeclaredProperties, getDeclaredMethods} from './util/classDeclarationUtils';
import {NgWalker} from './angular/ngWalker';
import {RecursiveAngularExpressionVisitor} from './angular/templates/recursiveAngularExpressionVisitor';
import * as e from '@angular/compiler/src/expression_parser/ast';
import * as ast from '@angular/compiler';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { ExpTypes } from './angular/expressionTypes';
import { Config } from './angular/config';
import SyntaxKind = require('./util/syntaxKind');

const InterpolationOpen = Config.interpolation[0];
const InterpolationClose = Config.interpolation[1];
const InterpolationNoWhitespaceRe = new RegExp(`${InterpolationOpen}\\S(.*?)\\S${InterpolationClose}`);
const InterpolationExtraWhitespaceRe =
  new RegExp(`${InterpolationOpen}\\s\\s(.*?)\\s${InterpolationClose}|${InterpolationOpen}\\s(.*?)\\s\\s${InterpolationClose}`);

const getReplacements = (text: ast.BoundTextAst, absolutePosition: number) => {
  const expr: string = (text.value as any).source;
  const trimmed = expr.substring(InterpolationOpen.length, expr.length - InterpolationClose.length).trim();
  return [
    new Lint.Replacement(absolutePosition + text.sourceSpan.start.offset,
      expr.length, `${InterpolationOpen} ${trimmed} ${InterpolationClose}`)
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
        const absolutePosition = this.getSourcePosition(text.value.span.start);
        this.addFailure(
          this.createFailure(text.sourceSpan.start.offset,
            expr.length, error, getReplacements(text, absolutePosition)));
      }
    }
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'templates-use-public-rule',
    type: 'functionality',
    description: `Ensure that properties and methods accessed from the template are public.`,
    rationale: `When Angular compiles the templates, it has to access these properties from outside the class.`,
    options: null,
    optionsDescription: `Not configurable.`,
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
