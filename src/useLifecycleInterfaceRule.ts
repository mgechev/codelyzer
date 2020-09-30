import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, WalkContext } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { ClassDeclaration, forEachChild, isClassDeclaration, Node, SourceFile } from 'typescript';
import { getDeclaredMethods } from './util/classDeclarationUtils';
import {
  AngularLifecycleInterfaceKeys,
  AngularLifecycleInterfaces,
  AngularLifecycleMethodKeys,
  getDeclaredAngularLifecycleInterfaces,
  getLifecycleInterfaceByMethodName,
  isAngularLifecycleMethod,
} from './util/utils';

interface FailureParameters {
  readonly interfaceName: AngularLifecycleInterfaceKeys;
  readonly methodName: AngularLifecycleMethodKeys;
}

const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-09-01';

export const getFailureMessage = (failureParameters: FailureParameters): string =>
  sprintf(Rule.FAILURE_STRING, failureParameters.interfaceName, failureParameters.methodName);

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures classes implement lifecycle interfaces corresponding to the declared lifecycle methods.',
    descriptionDetails: `See more at ${STYLE_GUIDE_LINK}`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Interfaces prescribe typed method signatures. Use those signatures to flag spelling and syntax mistakes.',
    ruleName: 'use-lifecycle-interface',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = `Lifecycle interface %s should be implemented for method %s. (${STYLE_GUIDE_LINK})`;

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

const validateClassDeclaration = (context: WalkContext, node: ClassDeclaration): void => {
  const declaredLifecycleInterfaces = getDeclaredAngularLifecycleInterfaces(node);
  const declaredMethods = getDeclaredMethods(node);

  for (const method of declaredMethods) {
    const { name: methodProperty } = method;
    const methodName = methodProperty.getText();

    if (!isAngularLifecycleMethod(methodName)) continue;

    const interfaceName = getLifecycleInterfaceByMethodName(methodName);
    const isMethodImplemented = declaredLifecycleInterfaces.includes(AngularLifecycleInterfaces[interfaceName]);

    if (isMethodImplemented) continue;

    const failure = getFailureMessage({ interfaceName, methodName });

    context.addFailureAtNode(methodProperty, failure);
  }
};

const walk = (context: WalkContext): void => {
  const { sourceFile } = context;

  const callback = (node: Node): void => {
    if (isClassDeclaration(node)) validateClassDeclaration(context, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
