import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { IOptions } from 'tslint';
import SyntaxKind = require('./util/syntaxKind');

export interface IUsePropertyDecoratorConfig {
  propertyName: string;
  decoratorName: string | string[];
  errorMessage: string;
}

export class UsePropertyDecorator extends Lint.Rules.AbstractRule {
  public static formatFailureString(config: IUsePropertyDecoratorConfig, decoratorName: string, className: string) {
    let decorators = config.decoratorName;
    if (decorators instanceof Array) {
      decorators = (<string[]>decorators).map(d => `"@${d}"`).join(', ');
    } else {
      decorators = `"@${decorators}"`;
    }
    return sprintf(config.errorMessage, decoratorName, className, config.propertyName, decorators);
  }

  constructor(private config: IUsePropertyDecoratorConfig, options: IOptions) {
    super(options);
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new DirectiveMetadataWalker(sourceFile,
        this.getOptions(),  this.config));
  }
}

class DirectiveMetadataWalker extends Lint.RuleWalker {
  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions, private config: IUsePropertyDecoratorConfig) {
      super(sourceFile, options);
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    (<ts.Decorator[]>node.decorators || [])
      .forEach(this.validateDecorator.bind(this, node.name.text));
    super.visitClassDeclaration(node);
  }

  private validateDecorator(className: string, decorator: ts.Decorator) {
    let baseExpr = <any>decorator.expression || {};
    let expr = baseExpr.expression || {};
    let name = expr.text;
    let args = baseExpr.arguments || [];
    let arg = args[0];
    if (/^(Component|Directive)$/.test(name) && arg) {
      this.validateProperty(className, name, arg);
    }
  }

  private validateProperty(className: string, decoratorName: string, arg: ts.ObjectLiteralExpression) {
    if (arg.kind === SyntaxKind.current().ObjectLiteralExpression) {
      (<ts.ObjectLiteralExpression>arg)
        .properties
        .filter(prop => (<any>prop.name).text === this.config.propertyName)
        .forEach(prop => {
          let p = <any>prop;
          this.addFailure(
            this.createFailure(
              p.getStart(),
              p.getWidth(),
              UsePropertyDecorator.formatFailureString(this.config, decoratorName, className)));
      });
    }
  }
}
