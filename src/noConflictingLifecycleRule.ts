import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, WalkContext } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import { ClassDeclaration, forEachChild, isClassDeclaration, Node, SourceFile } from 'typescript';
import {
  getDeclaredLifecycleInterfaces,
  getDeclaredLifecycleMethods,
  LifecycleInterfaceKeys,
  LifecycleInterfaces,
  LifecycleMethodKeys,
  LifecycleMethods
} from './util/utils';

interface FailureParameters {
  readonly message: typeof Rule.FAILURE_STRING_INTERFACE_HOOK | typeof Rule.FAILURE_STRING_METHOD_HOOK;
}

const LIFECYCLE_INTERFACES: ReadonlyArray<LifecycleInterfaceKeys> = [LifecycleInterfaces.DoCheck, LifecycleInterfaces.OnChanges];
const LIFECYCLE_METHODS: ReadonlyArray<LifecycleMethodKeys> = [LifecycleMethods.ngDoCheck, LifecycleMethods.ngOnChanges];

export const getFailureMessage = (failureParameters: FailureParameters): string => sprintf(failureParameters.message);

export class Rule extends AbstractRule {
  static metadata: IRuleMetadata = {
    description: 'Ensures that directives not implement conflicting lifecycle interfaces.',
    descriptionDetails: 'See more at https://angular.io/api/core/DoCheck#description.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: dedent`
      A directive typically should not use both ${LifecycleInterfaces.DoCheck} and ${LifecycleInterfaces.OnChanges} to respond
      to changes on the same input, as ${LifecycleMethods.ngOnChanges} will continue to be called when the
      default change detector detects changes.
    `,
    ruleName: 'no-conflicting-lifecycle',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING_INTERFACE_HOOK = dedent`
    Implementing ${LifecycleInterfaces.DoCheck} and ${LifecycleInterfaces.OnChanges} in a class is not recommended
  `;
  static readonly FAILURE_STRING_METHOD_HOOK = dedent`
    Declaring ${LifecycleMethods.ngDoCheck} and ${LifecycleMethods.ngOnChanges} method in a class is not recommended
  `;

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

const validateClassDeclaration = (context: WalkContext<void>, node: ClassDeclaration): void => {
  validateInterfaces(context, node);
  validateMethods(context, node);
};

const validateInterfaces = (context: WalkContext<void>, node: ClassDeclaration): void => {
  const declaredLifecycleInterfaces = getDeclaredLifecycleInterfaces(node);
  const hasConflictingLifecycle = LIFECYCLE_INTERFACES.every(
    lifecycleInterface => declaredLifecycleInterfaces.indexOf(lifecycleInterface) !== -1
  );

  if (!hasConflictingLifecycle) return;

  const failure = getFailureMessage({
    message: Rule.FAILURE_STRING_INTERFACE_HOOK
  });

  context.addFailureAtNode(node, failure);
};

const validateMethods = (context: WalkContext<void>, node: ClassDeclaration): void => {
  const declaredLifecycleMethods = getDeclaredLifecycleMethods(node);
  const hasConflictingLifecycle = LIFECYCLE_METHODS.every(lifecycleMethod => declaredLifecycleMethods.indexOf(lifecycleMethod) !== -1);

  if (!hasConflictingLifecycle) return;

  const failure = getFailureMessage({
    message: Rule.FAILURE_STRING_METHOD_HOOK
  });

  context.addFailureAtNode(node, failure);
};

const walk = (context: WalkContext<void>): void => {
  const { sourceFile } = context;

  const callback = (node: Node): void => {
    if (isClassDeclaration(node)) validateClassDeclaration(context, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
