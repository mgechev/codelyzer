import * as Lint from 'tslint';
import * as ts from 'typescript';
import * as ast from '@angular/compiler';
import { sprintf } from 'sprintf-js';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { NgWalker } from './angular/ngWalker';
import * as compiler from '@angular/compiler';
import { Binary } from '@angular/compiler';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'template-conditional-complexity',
    type: 'functionality',
    description: "The condition complexity shouldn't exceed a rational limit in a template.",
    rationale: 'An important complexity complicates the tests and the maintenance.',
    options: {
      type: 'array',
      items: {
        type: 'string'
      },
      minLength: 0,
      maxLength: 2
    },
    optionExamples: ['true', '[true, 4]'],
    optionsDescription: 'Determine the maximum number of Boolean operators allowed.',
    typescriptOnly: true,
    hasFix: false
  };

  static COMPLEXITY_FAILURE_STRING = "The condition complexity (cost '%s') exceeded the defined limit (cost '%s'). The conditional expression should be moved into the component.";

  static COMPLEXITY_MAX = 3;

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: TemplateConditionalComplexityVisitor
      })
    );
  }
}

class TemplateConditionalComplexityVisitor extends BasicTemplateAstVisitor {
  visitDirectiveProperty(prop: ast.BoundDirectivePropertyAst, context: BasicTemplateAstVisitor): any {
    if (prop.sourceSpan) {
      const directive = (<any>prop.sourceSpan).toString();

      if (directive.startsWith('*ngIf')) {
        // extract expression and drop characters new line and quotes
        const expr = directive
          .split(/\*ngIf\s*=\s*/)[1]
          .slice(1, -1)
          .replace(/[\n\r]/g, '');

        const expressionParser = new compiler.Parser(new compiler.Lexer());
        const ast = expressionParser.parseAction(expr, null);

        let complexity = 0;
        let conditions: Array<Binary> = [];
        let condition = ast.ast as Binary;
        if (condition.operation) {
          complexity++;
          conditions.push(condition);
        }

        while (conditions.length > 0) {
          condition = conditions.pop();
          if (condition.operation) {
            if (condition.left instanceof Binary) {
              complexity++;
              conditions.push(condition.left as Binary);
            }

            if (condition.right instanceof Binary) {
              conditions.push(condition.right as Binary);
            }
          }
        }
        const options = this.getOptions();
        const complexityMax: number = options.length ? options[0] : Rule.COMPLEXITY_MAX;

        if (complexity > complexityMax) {
          const span = prop.sourceSpan;
          let failureConfig: string[] = [String(complexity), String(complexityMax)];
          failureConfig.unshift(Rule.COMPLEXITY_FAILURE_STRING);
          this.addFailure(this.createFailure(span.start.offset, span.end.offset - span.start.offset, sprintf.apply(this, failureConfig)));
        }
      }
    }
    super.visitDirectiveProperty(prop, context);
  }
}
