import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { getSymbolName } from './util/utils';

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Ensure that components implement life cycle interfaces if they use them.',
    descriptionDetails: 'See more at https://angular.io/styleguide#style-09-01.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Interfaces prescribe typed method signatures. Use those signatures to flag spelling and syntax mistakes.',
    ruleName: 'use-life-cycle-interface',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING =
    'Implement life cycle hook interface %s for method %s in class %s (https://angular.io/styleguide#style-09-01)';
  static readonly HOOKS_PREFIX = 'ng';
  static readonly LIFE_CYCLE_HOOKS_NAMES: string[] = [
    'OnChanges',
    'OnInit',
    'DoCheck',
    'AfterContentInit',
    'AfterContentChecked',
    'AfterViewInit',
    'AfterViewChecked',
    'OnDestroy'
  ];

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
  }
}

export class ClassMetadataWalker extends Lint.RuleWalker {
  visitClassDeclaration(node: ts.ClassDeclaration) {
    const className = node.name!.text;
    const interfaces = this.extractInterfaces(node);
    const methods = node.members.filter(ts.isMethodDeclaration);

    this.validateMethods(methods, interfaces, className);
    super.visitClassDeclaration(node);
  }

  private extractInterfaces(node: ts.ClassDeclaration): string[] {
    let interfaces: string[] = [];
    if (node.heritageClauses) {
      const interfacesClause = node.heritageClauses.filter(h => h.token === ts.SyntaxKind.ImplementsKeyword);
      if (interfacesClause.length !== 0) {
        interfaces = interfacesClause[0].types.map(getSymbolName);
      }
    }
    return interfaces;
  }

  private validateMethods(methods: ts.ClassElement[], interfaces: string[], className: string) {
    methods.forEach(m => {
      const name = m.name!;
      const methodName = name.getText();

      if (methodName && this.isMethodValidHook(methodName, interfaces)) {
        const hookName = methodName.slice(2);
        this.addFailureAtNode(name, sprintf(Rule.FAILURE_STRING, hookName, `${Rule.HOOKS_PREFIX}${hookName}`, className));
      }
    });
  }

  private isMethodValidHook(methodName: string, interfaces: string[]): boolean {
    const isNg = methodName.slice(0, 2) === Rule.HOOKS_PREFIX;
    const hookName = methodName.slice(2);
    const isHook = Rule.LIFE_CYCLE_HOOKS_NAMES.indexOf(hookName) !== -1;
    const isNotIn = interfaces.indexOf(hookName) === -1;

    return isNg && isHook && isNotIn;
  }
}
