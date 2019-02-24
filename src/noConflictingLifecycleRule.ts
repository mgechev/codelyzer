import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, RuleWalker } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import { ClassDeclaration, SourceFile } from 'typescript';
import {
  getClassName,
  getDeclaredLifecycleInterfaces,
  getDeclaredLifecycleMethods,
  LifecycleInterfaceKeys,
  LifecycleInterfaces,
  LifecycleMethodKeys,
  LifecycleMethods
} from './util/utils';

interface FailureParameters {
  readonly className: string;
  readonly message: typeof Rule.FAILURE_STRING_INTERFACE_HOOK | typeof Rule.FAILURE_STRING_METHOD_HOOK;
}

const LIFECYCLE_INTERFACES: ReadonlyArray<LifecycleInterfaceKeys> = [LifecycleInterfaces.DoCheck, LifecycleInterfaces.OnChanges];
const LIFECYCLE_METHODS: ReadonlyArray<LifecycleMethodKeys> = [LifecycleMethods.ngDoCheck, LifecycleMethods.ngOnChanges];

export const getFailureMessage = (failureParameters: FailureParameters): string =>
  sprintf(failureParameters.message, failureParameters.className);

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
    Implementing ${LifecycleInterfaces.DoCheck} and ${LifecycleInterfaces.OnChanges} in class %s is not recommended
  `;
  static readonly FAILURE_STRING_METHOD_HOOK = dedent`
    Declaring ${LifecycleMethods.ngDoCheck} and ${LifecycleMethods.ngOnChanges} method in class %s is not recommended
  `;

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
  }
}

class ClassMetadataWalker extends RuleWalker {
  visitClassDeclaration(node: ClassDeclaration): void {
    this.validateInterfaces(node);
    this.validateMethods(node);
    super.visitClassDeclaration(node);
  }

  private validateInterfaces(node: ClassDeclaration): void {
    const className = getClassName(node);
    const declaredLifecycleInterfaces = getDeclaredLifecycleInterfaces(node);
    const hasConflictingLifecycle = LIFECYCLE_INTERFACES.every(
      lifecycleInterface => declaredLifecycleInterfaces.indexOf(lifecycleInterface) !== -1
    );

    if (!className || !hasConflictingLifecycle) return;

    const failure = getFailureMessage({
      className,
      message: Rule.FAILURE_STRING_INTERFACE_HOOK
    });

    this.addFailureAtNode(node, failure);
  }

  private validateMethods(node: ClassDeclaration): void {
    const className = getClassName(node);
    const declaredLifecycleMethods = getDeclaredLifecycleMethods(node);
    const hasConflictingLifecycle = LIFECYCLE_METHODS.every(lifecycleMethod => declaredLifecycleMethods.indexOf(lifecycleMethod) !== -1);

    if (!className || !hasConflictingLifecycle) return;

    const failure = getFailureMessage({
      className,
      message: Rule.FAILURE_STRING_METHOD_HOOK
    });

    this.addFailureAtNode(node, failure);
  }
}
