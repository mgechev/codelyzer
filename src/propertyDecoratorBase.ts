import { sprintf } from 'sprintf-js';
import { IOptions, RuleFailure, RuleWalker } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { arrayify } from 'tslint/lib/utils';
import { ClassDeclaration, createNodeArray, Decorator, isObjectLiteralExpression, ObjectLiteralExpression, SourceFile } from 'typescript';
import { getDecoratorArgument, getDecoratorName } from './util/utils';

export interface PropertyDecoratorConfig {
  readonly decoratorName: string | string[];
  readonly errorMessage: string;
  readonly propertyName: string;
}

const formatFailureString = (config: PropertyDecoratorConfig, decoratorStr: string, className: string): string => {
  const { decoratorName, errorMessage, propertyName } = config;
  const decorators = arrayify(decoratorName)
    .map(d => `"@${d}"`)
    .join(', ');

  return sprintf(errorMessage, decoratorStr, className, propertyName, decorators);
};

export class UsePropertyDecorator extends AbstractRule {
  constructor(private readonly config: PropertyDecoratorConfig, options: IOptions) {
    super(options);
  }

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new DirectiveMetadataWalker(sourceFile, this.getOptions(), this.config));
  }
}

class DirectiveMetadataWalker extends RuleWalker {
  constructor(sourceFile: SourceFile, options: IOptions, private readonly config: PropertyDecoratorConfig) {
    super(sourceFile, options);
  }

  protected visitClassDeclaration(node: ClassDeclaration): void {
    this.validateClassDeclaration(node);
    super.visitClassDeclaration(node);
  }

  private validateClassDeclaration(node: ClassDeclaration): void {
    const { decorators, name: nodeName } = node;

    if (!nodeName) return;

    createNodeArray(decorators).forEach(decorator => this.validateDecorator(nodeName.text, decorator));
  }

  private validateDecorator(className: string, decorator: Decorator): void {
    const decoratorArgument = getDecoratorArgument(decorator);
    const decoratorName = getDecoratorName(decorator);

    if (!decoratorName || !decoratorArgument || !/^(Component|Directive)$/.test(decoratorName)) {
      return;
    }

    this.validateProperty(className, decoratorName, decoratorArgument);
  }

  private validateProperty(className: string, decoratorName: string, decoratorArgument: ObjectLiteralExpression): void {
    if (!isObjectLiteralExpression(decoratorArgument)) return;

    decoratorArgument.properties
      .filter(property => property.name && property.name.getText() === this.config.propertyName)
      .forEach(property => this.addFailureAtNode(property, formatFailureString(this.config, decoratorName, className)));
  }
}
