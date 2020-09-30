import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, WalkContext } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import { ClassDeclaration, forEachChild, isClassDeclaration, Node, SourceFile } from 'typescript/lib/typescript';
import { AngularClassDecorators, getDeclaredInterfaceName, getPipeDecorator } from './util/utils';

const PIPE_TRANSFORM = 'PipeTransform';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: `Ensures that classes decorated with @${AngularClassDecorators.Pipe} implement ${PIPE_TRANSFORM} interface.`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Interfaces prescribe typed method signatures. Use those signatures to flag spelling and syntax mistakes.',
    ruleName: 'use-pipe-transform-interface',
    type: 'maintainability',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = dedent`
    Classes decorated with @${AngularClassDecorators.Pipe} decorator should
    implement ${PIPE_TRANSFORM} interface
  `;

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

const validateClassDeclaration = (context: WalkContext, node: ClassDeclaration): void => {
  if (!getPipeDecorator(node) || getDeclaredInterfaceName(node, PIPE_TRANSFORM)) return;

  context.addFailureAtNode(node, sprintf(Rule.FAILURE_STRING));
};

const walk = (context: WalkContext): void => {
  const { sourceFile } = context;

  const callback = (node: Node): void => {
    if (isClassDeclaration(node)) validateClassDeclaration(context, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
