import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, RuleWalker } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { ClassDeclaration, SourceFile } from 'typescript';
import { getDeclaredMethods } from './util/classDeclarationUtils';
import {
  getClassName,
  getDeclaredLifecycleInterfaces,
  isLifecycleMethod,
  LifecycleInterfaceKeys,
  LifecycleInterfaces,
  LifecycleMethodKeys
} from './util/utils';

interface FailureParameters {
  readonly className: string;
  readonly interfaceName: LifecycleInterfaceKeys;
  readonly methodName: LifecycleMethodKeys;
}

const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-09-01';

export const getFailureMessage = (failureParameters: FailureParameters): string =>
  sprintf(Rule.FAILURE_STRING, failureParameters.interfaceName, failureParameters.methodName, failureParameters.className);

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures classes implement lifecycle interfaces corresponding to the declared lifecycle methods.',
    descriptionDetails: `See more at ${STYLE_GUIDE_LINK}`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Interfaces prescribe typed method signatures. Use those signatures to flag spelling and syntax mistakes.',
    ruleName: 'use-lifecycle-interface',
    type: 'functionality',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = `Implement lifecycle interface %s for method %s in class %s (${STYLE_GUIDE_LINK})`;

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
  }
}

class ClassMetadataWalker extends RuleWalker {
  protected visitClassDeclaration(node: ClassDeclaration): void {
    this.validateClassDeclaration(node);
    super.visitClassDeclaration(node);
  }

  private validateClassDeclaration(node: ClassDeclaration): void {
    const className = getClassName(node);

    if (!className) return;

    const declaredLifecycleInterfaces = getDeclaredLifecycleInterfaces(node);
    const declaredMethods = getDeclaredMethods(node);

    for (const method of declaredMethods) {
      const { name: methodProperty } = method;
      const methodName = methodProperty.getText();

      if (!isLifecycleMethod(methodName)) continue;

      const interfaceName = methodName.slice(2) as LifecycleInterfaceKeys;
      const isMethodImplemented = declaredLifecycleInterfaces.indexOf(LifecycleInterfaces[interfaceName]) !== -1;

      if (isMethodImplemented) continue;

      const failure = getFailureMessage({ className, interfaceName, methodName });

      this.addFailureAtNode(methodProperty, failure);
    }
  }
}
