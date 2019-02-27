import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { ClassDeclaration, Decorator, SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import {
  getDecoratorName,
  isLifecycleMethod,
  isMetadataType,
  LifecycleMethodKeys,
  LifecycleMethods,
  METADATA_TYPE_LIFECYCLE_MAPPER,
  MetadataTypeKeys,
  MetadataTypes
} from './util/utils';
import { InjectableMetadata, PipeMetadata } from './angular';

interface FailureParameters {
  readonly metadataType: MetadataTypeKeys;
  readonly methodName: LifecycleMethodKeys;
}

export const getFailureMessage = (failureParameters: FailureParameters): string =>
  sprintf(Rule.FAILURE_STRING, failureParameters.methodName, failureParameters.metadataType);

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that classes use allowed lifecycle method in its body.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: `Some lifecycle methods can only be used in certain class types. For example, ${
      LifecycleMethods.ngOnInit
    }() method should not be used in an @${MetadataTypes.Injectable} class.`,
    ruleName: 'contextual-lifecycle',
    type: 'functionality',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'The method "%s" is not allowed for a class decorated with "%s"';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new ContextualLifecycleWalker(sourceFile, this.getOptions()));
  }
}

class ContextualLifecycleWalker extends NgWalker {
  visitNgInjectable(metadata: InjectableMetadata): void {
    this.validateDecorator(metadata.controller, metadata.decorator, METADATA_TYPE_LIFECYCLE_MAPPER.Injectable);
    super.visitNgInjectable(metadata);
  }

  visitNgPipe(metadata: PipeMetadata): void {
    this.validateDecorator(metadata.controller, metadata.decorator, METADATA_TYPE_LIFECYCLE_MAPPER.Pipe);
    super.visitNgPipe(metadata);
  }

  private validateDecorator(controller: ClassDeclaration, decorator: Decorator, allowedMethods: ReadonlySet<LifecycleMethodKeys>): void {
    const metadataType = getDecoratorName(decorator);

    if (!metadataType || !isMetadataType(metadataType)) return;

    for (const member of controller.members) {
      const { name: memberName } = member;

      if (!memberName) continue;

      const methodName = memberName.getText();

      if (!isLifecycleMethod(methodName) || allowedMethods.has(methodName)) continue;

      const failure = getFailureMessage({ metadataType, methodName });

      this.addFailureAtNode(member, failure);
    }
  }
}
