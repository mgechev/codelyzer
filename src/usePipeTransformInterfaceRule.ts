import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure, Rules, RuleWalker } from 'tslint/lib';
import { ClassDeclaration, SourceFile, SyntaxKind } from 'typescript/lib/typescript';
import { getDecoratorName, getSymbolName } from './util/utils';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensure that pipes implement PipeTransform interface.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Interfaces prescribe typed method signatures. Use those signatures to flag spelling and syntax mistakes.',
    ruleName: 'use-pipe-transform-interface',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'The %s class has the Pipe decorator, so it should implement the PipeTransform interface';
  static readonly PIPE_INTERFACE_NAME = 'PipeTransform';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
  }
}

const hasPipe = (node: ClassDeclaration): boolean => {
  return !!(node.decorators && node.decorators.map(getDecoratorName).some(t => t === 'Pipe'));
};

const hasPipeTransform = (node: ClassDeclaration): boolean => {
  const { heritageClauses } = node;

  if (!heritageClauses) {
    return false;
  }

  const interfacesClauses = heritageClauses.filter(h => h.token === SyntaxKind.ImplementsKeyword);

  return interfacesClauses.length > 0 && interfacesClauses[0].types.map(getSymbolName).indexOf(Rule.PIPE_INTERFACE_NAME) !== -1;
};

export class ClassMetadataWalker extends RuleWalker {
  visitClassDeclaration(node: ClassDeclaration) {
    this.validateClassDeclaration(node);
    super.visitClassDeclaration(node);
  }

  private validateClassDeclaration(node: ClassDeclaration) {
    if (!hasPipe(node) || hasPipeTransform(node)) {
      return;
    }

    this.addFailureAtNode(node, sprintf(Rule.FAILURE_STRING, node.name!.text));
  }
}
