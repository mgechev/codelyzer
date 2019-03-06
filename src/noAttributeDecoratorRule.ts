import { IRuleMetadata, RuleFailure, WalkContext } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import {
  ConstructorDeclaration,
  Decorator,
  forEachChild,
  isConstructorDeclaration,
  Node,
  ParameterDeclaration,
  SourceFile
} from 'typescript';
import { getDecoratorName } from './util/utils';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Disallows usage of @Attribute decorator.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: '@Attribute is considered bad practice. Use @Input instead.',
    ruleName: 'no-attribute-decorator',
    type: 'functionality',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = '@Attribute is considered bad practice. Use @Input instead.';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

const isAttributeDecorator = (decorator: Decorator): boolean => getDecoratorName(decorator) === 'Attribute';

const validateConstructor = (context: WalkContext<void>, node: ConstructorDeclaration): void =>
  node.parameters.forEach(parameter => validateParameter(context, parameter));

const validateDecorator = (context: WalkContext<void>, decorator: Decorator): void => {
  if (!isAttributeDecorator(decorator)) return;

  context.addFailureAtNode(decorator, Rule.FAILURE_STRING);
};

const validateParameter = (context: WalkContext<void>, parameter: ParameterDeclaration): void => {
  const { decorators } = parameter;

  if (!decorators) return;

  decorators.forEach(decorator => validateDecorator(context, decorator));
};

const walk = (context: WalkContext<void>): void => {
  const { sourceFile } = context;

  const callback = (node: Node): void => {
    if (isConstructorDeclaration(node)) validateConstructor(context, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
