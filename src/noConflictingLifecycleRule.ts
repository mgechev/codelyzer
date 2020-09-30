import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, WalkContext } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import { ClassDeclaration, forEachChild, isClassDeclaration, Node, SourceFile } from 'typescript';
import {
  AngularLifecycleInterfaceKeys,
  AngularLifecycleInterfaces,
  AngularLifecycleMethodKeys,
  AngularLifecycleMethods,
  getDeclaredAngularLifecycleInterfaces,
  getDeclaredAngularLifecycleMethods,
} from './util/utils';

interface FailureParameters {
  readonly message: typeof Rule.FAILURE_STRING_INTERFACE_HOOK | typeof Rule.FAILURE_STRING_METHOD_HOOK;
}

const LIFECYCLE_INTERFACES: ReadonlyArray<AngularLifecycleInterfaceKeys> = [
  AngularLifecycleInterfaces.DoCheck,
  AngularLifecycleInterfaces.OnChanges,
];
const LIFECYCLE_METHODS: ReadonlyArray<AngularLifecycleMethodKeys> = [
  AngularLifecycleMethods.ngDoCheck,
  AngularLifecycleMethods.ngOnChanges,
];

export const getFailureMessage = (failureParameters: FailureParameters): string => sprintf(failureParameters.message);

export class Rule extends AbstractRule {
  static metadata: IRuleMetadata = {
    description: 'Ensures that directives not implement conflicting lifecycle interfaces.',
    descriptionDetails: 'See more at https://angular.io/api/core/DoCheck#description.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: dedent`
      A directive typically should not use both ${AngularLifecycleInterfaces.DoCheck} and ${AngularLifecycleInterfaces.OnChanges} to respond
      to changes on the same input, as ${AngularLifecycleMethods.ngOnChanges} will continue to be called when the
      default change detector detects changes.
    `,
    ruleName: 'no-conflicting-lifecycle',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING_INTERFACE_HOOK = dedent`
    Implementing ${AngularLifecycleInterfaces.DoCheck} and ${AngularLifecycleInterfaces.OnChanges} in a class is not recommended
  `;
  static readonly FAILURE_STRING_METHOD_HOOK = dedent`
    Declaring ${AngularLifecycleMethods.ngDoCheck} and ${AngularLifecycleMethods.ngOnChanges} method in a class is not recommended
  `;

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

const validateClassDeclaration = (context: WalkContext, node: ClassDeclaration): void => {
  validateInterfaces(context, node);
  validateMethods(context, node);
};

const validateInterfaces = (context: WalkContext, node: ClassDeclaration): void => {
  const declaredAngularLifecycleInterfaces = getDeclaredAngularLifecycleInterfaces(node);
  const hasConflictingLifecycle = LIFECYCLE_INTERFACES.every((lifecycleInterface) =>
    declaredAngularLifecycleInterfaces.includes(lifecycleInterface)
  );

  if (!hasConflictingLifecycle) return;

  const failure = getFailureMessage({
    message: Rule.FAILURE_STRING_INTERFACE_HOOK,
  });

  context.addFailureAtNode(node, failure);
};

const validateMethods = (context: WalkContext, node: ClassDeclaration): void => {
  const declaredAngularLifecycleMethods = getDeclaredAngularLifecycleMethods(node);
  const hasConflictingLifecycle = LIFECYCLE_METHODS.every((lifecycleMethod) => declaredAngularLifecycleMethods.includes(lifecycleMethod));

  if (!hasConflictingLifecycle) return;

  const failure = getFailureMessage({
    message: Rule.FAILURE_STRING_METHOD_HOOK,
  });

  context.addFailureAtNode(node, failure);
};

const walk = (context: WalkContext): void => {
  const { sourceFile } = context;

  const callback = (node: Node): void => {
    if (isClassDeclaration(node)) validateClassDeclaration(context, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
