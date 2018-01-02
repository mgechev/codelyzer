import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'import-destructuring-spacing',
    type: 'style',
    description: 'Ensure consistent and tidy imports.',
    rationale: 'Imports are easier for the reader to look at when they\'re tidy.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
  };

  public static FAILURE_STRING = 'You need to leave whitespaces inside of the import statement\'s curly braces';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ImportDestructuringSpacingWalker(sourceFile, this.getOptions()));
  }
}

// The walker takes care of all the work.
class ImportDestructuringSpacingWalker extends Lint.RuleWalker {
  private scanner: ts.Scanner;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);
    this.scanner = ts.createScanner(ts.ScriptTarget.ES5, false, ts.LanguageVariant.Standard, sourceFile.text);
  }

  public visitImportDeclaration(node: ts.ImportDeclaration) {
    const importClause = node.importClause;
    if (importClause && importClause.namedBindings) {
      const text = importClause.namedBindings.getText();

      if (!this.checkForWhiteSpace(text)) {
        this.addFailure(this.createFailure(importClause.namedBindings.getStart(),
          importClause.namedBindings.getWidth(), Rule.FAILURE_STRING));
      }
    }
    // call the base version of this visitor to actually parse this node
    super.visitImportDeclaration(node);
  }

  private checkForWhiteSpace(text: string) {
    if (/\s*\*\s+as\s+[^\s]/.test(text)) {
      return true;
    }
    return /{\s[^]*\s}/.test(text);
  }
}
