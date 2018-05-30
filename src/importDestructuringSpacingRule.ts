import { Fix, IOptions, IRuleMetadata, Replacement, RuleFailure, Rules, RuleWalker } from 'tslint/lib';
import { NamedImports, SourceFile } from 'typescript/lib/typescript';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensure consistent and tidy imports.',
    hasFix: true,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: "Imports are easier for the reader to look at when they're tidy.",
    ruleName: 'import-destructuring-spacing',
    type: 'style',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = "Import statement's curly braces must be spaced exactly by a space to the right and a space to the left";

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new ImportDestructuringSpacingWalker(sourceFile, this.getOptions()));
  }
}

export const getFailureMessage = (): string => {
  return Rule.FAILURE_STRING;
};

const isBlankOrMultilineImport = (value: string): boolean => {
  return value.indexOf('\n') !== -1 || /^\{\s*\}$/.test(value);
};

class ImportDestructuringSpacingWalker extends RuleWalker {
  constructor(sourceFile: SourceFile, options: IOptions) {
    super(sourceFile, options);
  }

  protected visitNamedImports(node: NamedImports): void {
    this.validateNamedImports(node);
    super.visitNamedImports(node);
  }

  private getFix(node: NamedImports, totalLeadingSpaces: number, totalTrailingSpaces: number): Fix {
    const nodeStartPos = node.getStart();
    const nodeEndPos = node.getEnd();
    const fix: Fix = [];

    if (totalLeadingSpaces === 0) {
      fix.push(Replacement.appendText(nodeStartPos + 1, ' '));
    } else if (totalLeadingSpaces > 1) {
      fix.push(Replacement.deleteText(nodeStartPos + 1, totalLeadingSpaces - 1));
    }

    if (totalTrailingSpaces === 0) {
      fix.push(Replacement.appendText(nodeEndPos - 1, ' '));
    } else if (totalTrailingSpaces > 1) {
      fix.push(Replacement.deleteText(nodeEndPos - totalTrailingSpaces, totalTrailingSpaces - 1));
    }

    return fix;
  }

  private validateNamedImports(node: NamedImports): void {
    const nodeText = node.getText();

    if (isBlankOrMultilineImport(nodeText)) {
      return;
    }

    const totalLeadingSpaces = nodeText.match(/^\{(\s*)/)![1].length;
    const totalTrailingSpaces = nodeText.match(/(\s*)}$/)![1].length;

    if (totalLeadingSpaces === 1 && totalTrailingSpaces === 1) {
      return;
    }

    const fix = this.getFix(node, totalLeadingSpaces, totalTrailingSpaces);

    this.addFailureAtNode(node, getFailureMessage(), fix);
  }
}
