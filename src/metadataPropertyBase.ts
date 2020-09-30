import { IOptions, RuleFailure, WalkContext } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { ClassDeclaration, createNodeArray, Decorator, forEachChild, isClassDeclaration, Node, SourceFile } from 'typescript';
import { getDecoratorName, getDecoratorPropertyInitializer } from './util/utils';

export interface MetadataPropertyConfig {
  readonly errorMessage: string;
  readonly propertyName: string;
}

const COMPONENT_DIRECTIVE_PATTERN = /^(Component|Directive)$/;

export class MetadataPropertyBase extends AbstractRule {
  constructor(private readonly config: MetadataPropertyConfig, options: IOptions) {
    super(options);
  }

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk, this.config);
  }
}

const validateClassDeclaration = (context: WalkContext<MetadataPropertyConfig>, node: ClassDeclaration): void =>
  createNodeArray(node.decorators).forEach((decorator) => validateDecorator(context, decorator));

const validateDecorator = (context: WalkContext<MetadataPropertyConfig>, decorator: Decorator): void => {
  const {
    options: { errorMessage, propertyName },
  } = context;
  const propertyExpression = getDecoratorPropertyInitializer(decorator, propertyName);
  const decoratorName = getDecoratorName(decorator);

  if (!decoratorName || !propertyExpression || !COMPONENT_DIRECTIVE_PATTERN.test(decoratorName)) {
    return;
  }

  context.addFailureAtNode(propertyExpression.parent, errorMessage);
};

const walk = (context: WalkContext<MetadataPropertyConfig>): void => {
  const { sourceFile } = context;

  const callback = (node: Node): void => {
    if (isClassDeclaration(node)) validateClassDeclaration(context, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
