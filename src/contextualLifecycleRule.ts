import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { SourceFile } from 'typescript';
import { InjectableMetadata, ModuleMetadata, PipeMetadata } from './angular';
import { NgWalker } from './angular/ngWalker';
import {
  getClassName,
  getDecoratorName,
  isLifecycleMethod,
  isMetadataType,
  LifecycleMethodKeys,
  LifecycleMethods,
  METADATA_TYPE_LIFECYCLE_MAPPER,
  MetadataTypeKeys,
  MetadataTypes
} from './util/utils';

interface FailureParameters {
  readonly className: string;
  readonly metadataType: MetadataTypeKeys;
  readonly methodName: LifecycleMethodKeys;
}

export const getFailureMessage = (failureParameters: FailureParameters): string =>
  sprintf(Rule.FAILURE_STRING, failureParameters.methodName, failureParameters.className, failureParameters.metadataType);

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

  static readonly FAILURE_STRING = 'The method "%s" is not allowed for class "%s" because it is decorated with "%s"';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  protected visitNgInjectable(metadata: InjectableMetadata): void {
    this.validateDecorator(metadata, METADATA_TYPE_LIFECYCLE_MAPPER.Injectable);
    super.visitNgInjectable(metadata);
  }

  protected visitNgPipe(metadata: PipeMetadata): void {
    this.validateDecorator(metadata, METADATA_TYPE_LIFECYCLE_MAPPER.Pipe);
    super.visitNgPipe(metadata);
  }

  protected visitNgModule(metadata: ModuleMetadata) {
    this.validateDecorator(metadata, METADATA_TYPE_LIFECYCLE_MAPPER.NgModule);
    super.visitNgModule(metadata);
  }

  private validateDecorator(metadata: PipeMetadata, allowedMethods: ReadonlySet<LifecycleMethodKeys>): void {
    const className = getClassName(metadata.controller)!;

    const metadataType = getDecoratorName(metadata.decorator);

    if (!metadataType || !isMetadataType(metadataType)) return;

    for (const member of metadata.controller.members) {
      const { name: memberName } = member;

      if (!memberName) continue;

      const methodName = memberName.getText();

      if (!isLifecycleMethod(methodName) || allowedMethods.has(methodName)) continue;

      const failure = getFailureMessage({ className, metadataType, methodName });

      this.addFailureAtNode(member, failure);
    }
  }
}
