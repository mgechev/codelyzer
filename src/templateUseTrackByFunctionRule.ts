import { BoundDirectivePropertyAst } from '@angular/compiler';
import { IRuleMetadata, RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

const PATTERN = /trackBy\s*:|\[ngForTrackBy\]\s*=\s*['"].*['"]/;
// current offset into the template
let currentOffset = 0;

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures trackBy function is used.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: "The use of 'trackBy' is considered a good practice.",
    ruleName: 'template-use-track-by-function',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'Missing trackBy function in ngFor directive';

  apply(sourceFile: SourceFile): RuleFailure[] {
    currentOffset = 0;

    const walkerConfig: NgWalkerConfig = { templateVisitorCtrl: TemplateVisitorCtrl };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

class TemplateUseTrackByFunctionVisitor extends BasicTemplateAstVisitor {
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
        start: { offset: startOffset },
      },
    } = prop;

    if (PATTERN.test((context.codeWithMap.source || '').substr(currentOffset))) {
      currentOffset = endOffset;

      return;
    }

    context.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_STRING);
  }
}

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  private readonly visitors: ReadonlySet<BasicTemplateAstVisitor> = new Set([
    new TemplateUseTrackByFunctionVisitor(this.getSourceFile(), this.getOptions(), this.context, this.templateStart),
  ]);

  visitDirectiveProperty(prop: BoundDirectivePropertyAst, context: BasicTemplateAstVisitor): any {
    this.visitors.forEach((visitor) => visitor.visitDirectiveProperty(prop, this));
    super.visitDirectiveProperty(prop, context);
  }
}
