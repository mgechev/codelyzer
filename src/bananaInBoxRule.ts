import * as Lint from 'tslint';
import * as ts from 'typescript';
import * as ast from '@angular/compiler';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { NgWalker } from './angular/ngWalker';


const InvalidSyntaxBoxOpen = '([';
const InvalidSyntaxBoxClose = '])';
const ValidSyntaxOpen = '[(';
const ValidSyntaxClose = ')]';
const InvalidSyntaxBoxRe = new RegExp('\\[(.*?)\\]');

const getReplacements = (text: ast.BoundEventAst, absolutePosition: number) => {
  const expr: string = (text.sourceSpan as any).toString();
  const internalStart = expr.indexOf(InvalidSyntaxBoxOpen);
  const internalEnd = expr.lastIndexOf(InvalidSyntaxBoxClose);
  const len = internalEnd - internalStart - InvalidSyntaxBoxClose.length;
  const trimmed = expr.substr(internalStart + InvalidSyntaxBoxOpen.length, len).trim();

  return [
    new Lint.Replacement(absolutePosition,
      internalEnd - internalStart + ValidSyntaxClose.length,
      `${ValidSyntaxOpen}${trimmed}${ValidSyntaxClose}`)
  ];
};

class BananaInBoxTemplateVisitor extends BasicTemplateAstVisitor {

  visitEvent(prop: ast.BoundEventAst, context: any): any {

    if (prop.name) {
      let error = null;
      if (InvalidSyntaxBoxRe.test(prop.name)) {
        error = 'Invalid binding syntax. Use [(expr)] instead';
      }

      if (error) {
        const expr: any = (<any>prop.sourceSpan).toString();
        const internalStart = expr.indexOf(InvalidSyntaxBoxOpen) + 1;
        const start = prop.sourceSpan.start.offset + internalStart;
        const absolutePosition = this.getSourcePosition(start - 1);

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
    description: 'Ensure that the two-way data binding syntax is correct.',
    rationale: 'The parens "()" should have been inside the brackets "[]".',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
    hasFix: true
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

    return this.applyWithWalker(
      new NgWalker(sourceFile,
        this.getOptions(), {
          templateVisitorCtrl: BananaInBoxTemplateVisitor,
        }));
  }
}
