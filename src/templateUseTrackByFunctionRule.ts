import { BoundDirectivePropertyAst } from '@angular/compiler';
import { IRuleMetadata, RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

// current offset into the template
export let curentOffset = 0;

const PATTERN = /\s*ngFor.*\s*trackBy\s*:|\[ngForTrackBy\]\s*=\s*['"].*['"]/;

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures trackBy function is used.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: "The use of 'trackBy' is considered a good practice.",
    ruleName: 'template-use-track-by-function',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Missing trackBy function in ngFor directive';

  apply(sourceFile: SourceFile): RuleFailure[] {
    curentOffset = 0;

    return this.applyWithWalker(new NgWalker(sourceFile, this.getOptions(), { templateVisitorCtrl: TemplateUseTrackByFunctionVisitor }));
  }
}

class TemplateUseTrackByFunctionTemplateVisitor extends BasicTemplateAstVisitor {
  visitDirectiveProperty(prop: BoundDirectivePropertyAst, context: BasicTemplateAstVisitor): any {
    this.validateDirective(prop, context);
    super.visitDirectiveProperty(prop, context);
  }

  private validateDirective(prop: BoundDirectivePropertyAst, context: BasicTemplateAstVisitor): any {
    const { templateName } = prop;

    if (templateName !== 'ngForOf') return;

    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset }
      }
    } = prop;

    if (PATTERN.test((context.codeWithMap.source || '').substr(curentOffset))) {
      curentOffset = endOffset;

      return;
    }

    context.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_STRING);
  }
}

class TemplateUseTrackByFunctionVisitor extends BasicTemplateAstVisitor {
  private readonly visitors: ReadonlySet<BasicTemplateAstVisitor> = new Set([
    new TemplateUseTrackByFunctionTemplateVisitor(this.getSourceFile(), this.getOptions(), this.context, this.templateStart)
  ]);

  visitDirectiveProperty(prop: BoundDirectivePropertyAst, context: BasicTemplateAstVisitor): any {
    this.visitors.forEach(visitor => visitor.visitDirectiveProperty(prop, this));
    super.visitDirectiveProperty(prop, context);
  }
}
