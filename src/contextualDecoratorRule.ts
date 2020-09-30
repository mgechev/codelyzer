import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, WalkContext } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import {
  AccessorDeclaration,
  createNodeArray,
  Decorator,
  forEachChild,
  isAccessor,
  isMethodDeclaration,
  isParameterPropertyDeclaration,
  isPropertyDeclaration,
  MethodDeclaration,
  Node,
  ParameterPropertyDeclaration,
  PropertyDeclaration,
  SourceFile,
} from 'typescript';
import { isNotNullOrUndefined } from './util/isNotNullOrUndefined';
import {
  ANGULAR_CLASS_DECORATOR_MAPPER,
  AngularClassDecoratorKeys,
  AngularClassDecorators,
  AngularInnerClassDecorators,
  getDecoratorName,
  getNextToLastParentNode,
  isAngularClassDecorator,
  isAngularInnerClassDecorator,
} from './util/utils';

interface FailureParameters {
  readonly classDecoratorName: AngularClassDecoratorKeys;
}

type DeclarationLike = AccessorDeclaration | MethodDeclaration | ParameterPropertyDeclaration | PropertyDeclaration;

export const getFailureMessage = (failureParameters: FailureParameters): string => {
  return sprintf(Rule.FAILURE_STRING, failureParameters.classDecoratorName);
};

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that classes use contextual decorators in its body.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: dedent`
      Some decorators should only be used in certain class types. For example,
      the decorator @${AngularInnerClassDecorators.Input}() should
      not be used in a class decorated with @${AngularClassDecorators.Injectable}().
    `,
    ruleName: 'contextual-decorator',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'Decorator out of context for "@%s()"';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

const callbackHandler = (walkContext: WalkContext, node: Node): void => {
  if (isDeclarationLike(node)) validateDeclaration(walkContext, node);
};

const getClassDecoratorName = (klass: Node): AngularClassDecoratorKeys | undefined => {
  return createNodeArray(klass.decorators).map(getDecoratorName).filter(isNotNullOrUndefined).find(isAngularClassDecorator);
};

const isDeclarationLike = (node: Node): node is DeclarationLike => {
  return isAccessor(node) || isMethodDeclaration(node) || isParameterPropertyDeclaration(node, node.parent) || isPropertyDeclaration(node);
};

const validateDeclaration = (walkContext: WalkContext, node: DeclarationLike): void => {
  const klass = getNextToLastParentNode(node);
  const classDecoratorName = getClassDecoratorName(klass);

  if (!classDecoratorName) return;

  createNodeArray(node.decorators).forEach((decorator) => validateDecorator(walkContext, decorator, classDecoratorName));
};

const validateDecorator = (walkContext: WalkContext, node: Decorator, classDecoratorName: AngularClassDecoratorKeys): void => {
  const decoratorName = getDecoratorName(node);

  if (!decoratorName || !isAngularInnerClassDecorator(decoratorName)) return;

  const allowedDecorators = ANGULAR_CLASS_DECORATOR_MAPPER.get(classDecoratorName);

  if (!allowedDecorators || allowedDecorators.has(decoratorName)) return;

  const failure = getFailureMessage({ classDecoratorName });

  walkContext.addFailureAtNode(node, failure);
};

const walk = (walkContext: WalkContext): void => {
  const { sourceFile } = walkContext;

  const callback = (node: Node): void => {
    callbackHandler(walkContext, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
