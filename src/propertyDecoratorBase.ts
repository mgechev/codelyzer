import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { getDecoratorArgument, getDecoratorName } from './util/utils';

export interface IUsePropertyDecoratorConfig {
  propertyName: string;
  decoratorName: string | string[];
  errorMessage: string;
}

export class UsePropertyDecorator extends Lint.Rules.AbstractRule {
  public static formatFailureString(config: IUsePropertyDecoratorConfig, decoratorStr: string, className: string) {
    const { decoratorName, errorMessage, propertyName } = config;
    let decorators: string | string[];

    if (decoratorName instanceof Array) {
      decorators = decoratorName.map(d => `"@${d}"`).join(', ');
    } else {
      decorators = `"@${decoratorName}"`;
    }

    return sprintf(errorMessage, decoratorStr, className, propertyName, decorators);
  }

  constructor(private config: IUsePropertyDecoratorConfig, options: Lint.IOptions) {
    super(options);
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new DirectiveMetadataWalker(sourceFile, this.getOptions(), this.config));
  }
}

class DirectiveMetadataWalker extends Lint.RuleWalker {
  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions, private config: IUsePropertyDecoratorConfig) {
    super(sourceFile, options);
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    ts.createNodeArray(node.decorators).forEach(this.validateDecorator.bind(this, node.name!.text));
    super.visitClassDeclaration(node);
  }

  private validateDecorator(className: string, decorator: ts.Decorator) {
    const argument = getDecoratorArgument(decorator)!;
    const name = getDecoratorName(decorator);

    if (name && argument && /^(Component|Directive)$/.test(name)) {
      this.validateProperty(className, name, argument);
    }
  }

  private validateProperty(className: string, decoratorName: string, arg: ts.ObjectLiteralExpression) {
    if (!ts.isObjectLiteralExpression(arg)) {
      return;
    }

    arg.properties.filter(prop => prop.name!.getText() === this.config.propertyName).forEach(prop => {
      this.addFailureAtNode(prop, UsePropertyDecorator.formatFailureString(this.config, decoratorName, className));
    });
  }
}
