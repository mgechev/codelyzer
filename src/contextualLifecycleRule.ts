import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import { SourceFile } from 'typescript';
import { InjectableMetadata, ModuleMetadata, PipeMetadata } from './angular';
import { NgWalker } from './angular/ngWalker';
import {
  ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER,
  AngularClassDecoratorKeys,
  AngularClassDecorators,
  AngularLifecycleMethodKeys,
  AngularLifecycleMethods,
  getClassName,
  getDecoratorName,
  isAngularClassDecorator,
  isAngularLifecycleMethod,
} from './util/utils';

interface FailureParameters {
  readonly className: string;
  readonly decoratorName: AngularClassDecoratorKeys;
  readonly methodName: AngularLifecycleMethodKeys;
}

export const getFailureMessage = (failureParameters: FailureParameters): string =>
  sprintf(Rule.FAILURE_STRING, failureParameters.methodName, failureParameters.className, failureParameters.decoratorName);

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that classes use allowed lifecycle method in its body.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: dedent`
      Some lifecycle methods can only be used in certain class types.
      For example, ${AngularLifecycleMethods.ngOnInit}() method should not be used
      in an @${AngularClassDecorators.Injectable} class.
    `,
    ruleName: 'contextual-lifecycle',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'The method "%s" is not allowed for class "%s" because it is decorated with "%s"';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  protected visitNgInjectable(metadata: InjectableMetadata): void {
    const injectableAllowedMethods = ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER.get(AngularClassDecorators.Injectable);

    if (!injectableAllowedMethods) return;

    this.validateDecorator(metadata, injectableAllowedMethods);
    super.visitNgInjectable(metadata);
  }

  protected visitNgModule(metadata: ModuleMetadata): void {
    const ngModuleAllowedMethods = ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER.get(AngularClassDecorators.NgModule);

    if (!ngModuleAllowedMethods) return;

    this.validateDecorator(metadata, ngModuleAllowedMethods);
    super.visitNgModule(metadata);
  }

  protected visitNgPipe(metadata: PipeMetadata): void {
    const pipeAllowedMethods = ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER.get(AngularClassDecorators.Pipe);

    if (!pipeAllowedMethods) return;

    this.validateDecorator(metadata, pipeAllowedMethods);
    super.visitNgPipe(metadata);
  }

  private validateDecorator(metadata: PipeMetadata, allowedMethods: ReadonlySet<AngularLifecycleMethodKeys>): void {
    const className = getClassName(metadata.controller)!;

    const decoratorName = getDecoratorName(metadata.decorator);

    if (!decoratorName || !isAngularClassDecorator(decoratorName)) return;

    for (const member of metadata.controller.members) {
      const { name: memberName } = member;

      if (!memberName) continue;

      const methodName = memberName.getText();

      if (!isAngularLifecycleMethod(methodName) || allowedMethods.has(methodName)) continue;

      const failure = getFailureMessage({ className, decoratorName, methodName });

      this.addFailureAtNode(member, failure);
    }
  }
}
