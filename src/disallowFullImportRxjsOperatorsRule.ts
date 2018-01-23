import { ImportDeclaration, SourceFile } from 'typescript';
import { IRuleMetadata, Replacement, RuleFailure, Rules, RuleWalker } from 'tslint';

const disallowedImports: string[] = [
  // lettable import
  '\'rxjs/operators\'',
  '"rxjs/operators"',
  // not-lettable import
  'rxjs/add/operator',
];

export class Rule extends Rules.AbstractRule {
  public static metadata: IRuleMetadata = {
    ruleName: 'disallow-full-import-rxjs-operators',
    type: 'maintainability',
    description: 'RxJS operators should be imported from it\'s own scope.',
    rationale: 'Helps to improve an angular bundle size. Angular has a dependency' +
    ' on RxJS and it helps to not increase a final bundle size.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
  };

  public static FAILURE_STRING = 'RxJS operators should be imported from their own scope.';

  public apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends RuleWalker {
  public visitImportDeclaration(importDeclaration: ImportDeclaration): void {
    const importDeclarationText: string = importDeclaration.getText();

    if (this.hasDisallowedImport(importDeclarationText)) {
      this.addFailureAt(
        importDeclaration.getStart(),
        importDeclaration.getWidth(),
        Rule.FAILURE_STRING,
        this.getFix(importDeclaration),
      );
    }
  }

  private hasDisallowedImport(importDeclarationText: string): boolean {
    return disallowedImports.some((i: string): boolean => importDeclarationText.indexOf(i) !== -1);
  }

  private getFix(importDeclaration: ImportDeclaration): Replacement {
    const fix: string = this.getRxJsOperators(importDeclaration)
      .reduce((prev: string[], curr: string): string[] => prev.concat([this.getRxJsOperatorImport(curr)]), [])
      .join('\n');

    return new Replacement(importDeclaration.getStart(), importDeclaration.getWidth(), fix);
  }

  private getRxJsOperators(importDeclaration: ImportDeclaration): string[] {
    if (!importDeclaration.importClause) {
      const operator: RegExpExecArray | null = /rxjs\/add\/operator\/(.*)['|"]+/.exec(importDeclaration.getText());
      return operator && operator[1] ? [operator[1]] : [];
    }

    return importDeclaration
      .importClause
      .getText()
      .replace(/[\s{}]*/g, '')
      .split(',')
      .filter((operator: string): boolean => operator.length > 0)
      .sort();
  }

  private getRxJsOperatorImport(operator: string): string {
    return `import {${operator}} from 'rxjs/operators/${operator}';`;
  }
}
