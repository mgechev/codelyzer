import { IRuleMetadata, RuleFailure, WalkContext } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import {
  ConstructorDeclaration,
  createNodeArray,
  Decorator,
  forEachChild,
  isConstructorDeclaration,
  Node,
  ParameterDeclaration,
  SourceFile,
} from 'typescript';
import { getDecoratorName } from './util/utils';

const ATTRIBUTE = 'Attribute';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: `Disallows usage of @${ATTRIBUTE} decorator.`,
    options: null,
    optionsDescription: 'Not configurable.',
    ruleName: 'no-attribute-decorator',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = `@${ATTRIBUTE} is considered bad practice. Use @Input instead.`;

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

const callbackHandler = (walkContext: WalkContext, node: Node): void => {
  if (isConstructorDeclaration(node)) validateConstructor(walkContext, node);
};

const isAttributeDecorator = (decorator: Decorator): boolean => getDecoratorName(decorator) === ATTRIBUTE;

const validateConstructor = (walkContext: WalkContext, node: ConstructorDeclaration): void => {
  node.parameters.forEach((parameter) => validateParameter(walkContext, parameter));
};

const validateDecorator = (walkContext: WalkContext, decorator: Decorator): void => {
  if (!isAttributeDecorator(decorator)) return;

  walkContext.addFailureAtNode(decorator, Rule.FAILURE_STRING);
};

const validateParameter = (walkContext: WalkContext, node: ParameterDeclaration): void => {
  createNodeArray(node.decorators).forEach((decorator) => validateDecorator(walkContext, decorator));
};

const walk = (walkContext: WalkContext): void => {
  const { sourceFile } = walkContext;

  const callback = (node: Node): void => {
    callbackHandler(walkContext, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
