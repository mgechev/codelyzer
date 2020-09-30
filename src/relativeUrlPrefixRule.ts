import { IOptions, IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import * as ts from 'typescript';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: "The ./ prefix is standard syntax for relative URLs; don't depend on Angular's current ability to do without that prefix.",
    descriptionDetails: 'See more at https://angular.io/styleguide#style-05-04.',
    rationale: 'A component relative URL requires no change when you move the component files, as long as the files stay together.',
    ruleName: 'relative-url-prefix',
    options: null,
    optionsDescription: 'Not configurable.',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'The ./ prefix is standard syntax for relative URLs. (https://angular.io/styleguide#style-05-04)';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  constructor(sourceFile: SourceFile, options: IOptions) {
    super(sourceFile, options);
  }

  visitClassDecorator(decorator: ts.Decorator) {
    if (ts.isCallExpression(decorator.expression) && decorator.expression.arguments) {
      decorator.expression.arguments.forEach((arg) => {
        if (ts.isObjectLiteralExpression(arg) && arg.properties) {
          arg.properties.forEach((prop: any) => {
            if (prop && prop.name.text === 'templateUrl') {
              const url = prop.initializer.text;
              this.checkTemplateUrl(url, prop.initializer);
            } else if (prop && prop.name.text === 'styleUrls') {
              if (prop.initializer.elements.length > 0) {
                prop.initializer.elements.forEach((e) => {
                  this.checkStyleUrls(e);
                });
              }
            }
          });
        }
      });
    }
    super.visitClassDecorator(decorator);
  }

  private checkTemplateUrl(url: string, initializer: ts.StringLiteral) {
    if (url && !/^\.\/[^\.\/|\.\.\/]/.test(url)) {
      this.addFailureAtNode(initializer, Rule.FAILURE_STRING);
    }
  }

  private checkStyleUrls(token: ts.StringLiteral) {
    if (token && token.text) {
      if (!/^\.\/[^\.\/|\.\.\/]/.test(token.text)) {
        this.addFailureAtNode(token, Rule.FAILURE_STRING);
      }
    }
  }
}
