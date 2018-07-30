import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { getSymbolName } from './util/utils';

export class Rule extends Lint.Rules.AbstractRule {
  static metadata: Lint.IRuleMetadata = {
    description: 'Ensure that directives not implement conflicting life cycle hooks.',
    descriptionDetails: 'See more at https://angular.io/api/core/DoCheck#description.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: Lint.Utils.dedent`
      A directive typically should not use both DoCheck and OnChanges to respond
      to changes on the same input, as ngOnChanges will continue to be called when the
      default change detector detects changes.
    `,
    ruleName: 'no-conflicting-life-cycle-hooks',
    type: 'maintainability',
    typescriptOnly: true
  };

  static FAILURE_STRING = 'Implement DoCheck and OnChanges hooks in class %s is not recommended';

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
  }
}

const hooksPrefix = 'ng';
const lifecycleHooksMethods: string[] = ['DoCheck', 'OnChanges'];

export class ClassMetadataWalker extends Lint.RuleWalker {
  visitClassDeclaration(node: ts.ClassDeclaration) {
    this.validateInterfaces(node);
    this.validateMethods(node);
    super.visitClassDeclaration(node);
  }

  private validateInterfaces(node: ts.ClassDeclaration): void {
    const { heritageClauses } = node;

    if (!heritageClauses) {
      return;
    }

    const interfacesClauses = heritageClauses.find(h => h.token === ts.SyntaxKind.ImplementsKeyword);

    if (!interfacesClauses) {
      return;
    }

    const interfaces = interfacesClauses.types.map(getSymbolName);
    const matchesAllHooks = lifecycleHooksMethods.every(l => interfaces.indexOf(l) !== -1);

    if (matchesAllHooks) {
      this.addFailureAtNode(node, sprintf(Rule.FAILURE_STRING, node.name!.text));
    }
  }

  private validateMethods(node: ts.ClassDeclaration): void {
    const methodNames = node.members.filter(ts.isMethodDeclaration).map(m => m.name!.getText());
    const matchesAllHooks = lifecycleHooksMethods.every(l => methodNames.indexOf(`${hooksPrefix}${l}`) !== -1);

    if (matchesAllHooks) {
      this.addFailureAtNode(node, sprintf(Rule.FAILURE_STRING, node.name!.text));
    }
  }
}
