import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, WalkContext } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { ClassDeclaration, forEachChild, isClassDeclaration, Node, SourceFile } from 'typescript/lib/typescript';
import { getDeclaredInterfaceName, getDecorator, MetadataTypes } from './util/utils';

const PIPE_TRANSFORM = 'PipeTransform';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: `Ensures that classes implementing ${PIPE_TRANSFORM} interface use @${MetadataTypes.Pipe} decorator.`,
    options: null,
    optionsDescription: 'Not configurable.',
    ruleName: 'use-pipe-decorator',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = `Classes that implement the ${PIPE_TRANSFORM} interface should be decorated with @${MetadataTypes.Pipe}`;

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

const hasPipeDecorator = (node: ClassDeclaration): boolean => !!getDecorator(node, MetadataTypes.Pipe);

const hasPipeTransformInterface = (node: ClassDeclaration): boolean => !!getDeclaredInterfaceName(node, PIPE_TRANSFORM);

const validateClassDeclaration = (context: WalkContext<void>, node: ClassDeclaration): void => {
  if (!hasPipeTransformInterface(node) || hasPipeDecorator(node)) return;

  context.addFailureAtNode(node, sprintf(Rule.FAILURE_STRING));
};

const walk = (context: WalkContext<void>): void => {
  const { sourceFile } = context;

  const callback = (node: Node): void => {
    if (isClassDeclaration(node)) validateClassDeclaration(context, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
