import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';
import * as ast from '@angular/compiler';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'trackBy-function',
    type: 'functionality',
    description: 'Ensures a TrackBy function is used.',
    rationale: 'Using TrackBy is considired as a best pratice.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile,
        this.getOptions(), {
          templateVisitorCtrl: TrackByTemplateVisitor,
        }));
  }
}

const ngForExpressionRe = new RegExp(/\*ngFor\s*=\s*(?:'|")(.+)(?:'|")/);
const trackByRe = new RegExp(/trackBy\s*:/);

class TrackByNgForTemplateVisitor extends BasicTemplateAstVisitor {
  static Error = 'Missing trackBy function in ngFor directive';

  visitDirectiveProperty(prop: ast.BoundDirectivePropertyAst, context: BasicTemplateAstVisitor): any {
    if (prop.sourceSpan) {
      const directive = (<any>prop.sourceSpan).toString();

      if (directive.startsWith('*ngFor')) {
        const directiveMatch = directive.match(ngForExpressionRe);
        const expr = directiveMatch && directiveMatch[1];

        if (expr && !trackByRe.test(expr)) {
          const span = prop.sourceSpan;
          context.addFailure(
            context.createFailure(span.start.offset, span.end.offset - span.start.offset, TrackByNgForTemplateVisitor.Error)
          );
        }
      }
    }
    super.visitDirectiveProperty(prop, context);
  }
}


class TrackByTemplateVisitor extends BasicTemplateAstVisitor {
  private visitors: (BasicTemplateAstVisitor)[] = [
    new TrackByNgForTemplateVisitor(this.getSourceFile(), this.getOptions(), this.context, this.templateStart)
  ];

  visitDirectiveProperty(prop: ast.BoundDirectivePropertyAst, context: any): any {
    this.visitors
      .map(v => v.visitDirectiveProperty(prop, this))
      .filter(f => !!f)
      .forEach(f => this.addFailure(f));
    super.visitDirectiveProperty(prop, context);
  }

}
