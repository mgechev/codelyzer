import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';

const getInterfaceName = (t: any) => {
  if (t.expression && t.expression.name) {
    return t.expression.name.text;
  }
  return t.expression.text;
};

export class Rule extends Lint.Rules.AbstractRule {
  static metadata: Lint.IRuleMetadata = {
    description: 'Ensure that components implement life cycle interfaces if they use them.',
    descriptionDetails: 'See more at https://angular.io/styleguide#style-09-01.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Interfaces prescribe typed method signatures. Use those signatures to flag spelling and syntax mistakes.',
    ruleName: 'use-life-cycle-interface',
    type: 'maintainability',
    typescriptOnly: true
  };

  static FAILURE_STRING = 'Implement life cycle hook interface %s for method %s in class %s (https://angular.io/styleguide#style-09-01)';

  static HOOKS_PREFIX = 'ng';

  static LIFE_CYCLE_HOOKS_NAMES: string[] = [
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
    let className = node.name.text;
    let interfaces = this.extractInterfaces(node);
    let methods = node.members.filter(m => m.kind === ts.SyntaxKind.MethodDeclaration);
    this.validateMethods(methods, interfaces, className);
    super.visitClassDeclaration(node);
  }

  private extractInterfaces(node: ts.ClassDeclaration): string[] {
    let interfaces: string[] = [];
    if (node.heritageClauses) {
      let interfacesClause = node.heritageClauses.filter(h => h.token === ts.SyntaxKind.ImplementsKeyword);
      if (interfacesClause.length !== 0) {
        interfaces = interfacesClause[0].types.map(getInterfaceName);
      }
    }
    return interfaces;
  }

  private validateMethods(methods: any[], interfaces: string[], className: string) {
    methods.forEach(m => {
      let n = (<any>m.name).text;
      if (n && this.isMethodValidHook(m, interfaces)) {
        let hookName = n.substr(2, n.lenght);
        this.addFailure(
          this.createFailure(
            m.name.getStart(),
            m.name.getWidth(),
            sprintf(Rule.FAILURE_STRING, hookName, Rule.HOOKS_PREFIX + hookName, className)
          )
        );
      }
    });
  }

  private isMethodValidHook(m: any, interfaces: string[]): boolean {
    let n = (<any>m.name).text;
    let isNg: boolean = n.substr(0, 2) === Rule.HOOKS_PREFIX;
    let hookName = n.substr(2, n.lenght);
    let isHook = Rule.LIFE_CYCLE_HOOKS_NAMES.indexOf(hookName) !== -1;
    let isNotIn: boolean = interfaces.indexOf(hookName) === -1;
    return isNg && isHook && isNotIn;
  }
}
