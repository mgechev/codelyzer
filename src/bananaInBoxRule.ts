import * as Lint from 'tslint';
import * as ts from 'typescript';
import * as ast from '@angular/compiler';
import {BasicTemplateAstVisitor} from './angular/templates/basicTemplateAstVisitor';
import {NgWalker} from './angular/ngWalker';



const BoxInABananaOpen = '([';
const BoxInABananaClose = '])';
const BananaInABoxOpen = '[(';
const BananaInABoxClose = ')]';
const BoxInABananaRe = new RegExp('\\(\\[(.*?)\\]\\)(.*?)');

const getReplacements = (text: ast.BoundEventAst, absolutePosition: number) => {
  const expr: string = (text.sourceSpan as any).toString();
  const internalStart = expr.indexOf('([');
  const internalEnd = expr.lastIndexOf('])');
  const len = internalEnd - internalStart - BoxInABananaClose.length;
  const trimmed = expr.substr(internalStart + BoxInABananaOpen.length, len).trim();

  return [
    new Lint.Replacement(absolutePosition,
      internalEnd - internalStart + BoxInABananaClose.length,
      `${BananaInABoxOpen}${trimmed}${BananaInABoxClose}`)
  ];
};

class BananaInBoxTemplateVisitor extends BasicTemplateAstVisitor {

  visitEvent(prop: ast.BoundEventAst, context: any): any {

    if (prop.sourceSpan) {
      // Note that will not be reliable for different interpolation symbols
      let error = null;
      const expr: any = (<any>prop.sourceSpan).toString();
        if (BoxInABananaRe.test(expr)) {
        error = 'The box is in a banana! Expecting Banana in a box [(expr)]';
      }

      if (error) {
        const internalStart = expr.indexOf(BoxInABananaOpen);
        const start = prop.sourceSpan.start.offset + internalStart;
        const absolutePosition = this.getSourcePosition(start);

        this.addFailure(this.createFailure(start, expr.trim().length,
          error, getReplacements(prop, absolutePosition))
          );
      }
    }
  }
}



export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'banana-in-box',
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
          templateVisitorCtrl: BananaInBoxTemplateVisitor,
        }));
  }
}