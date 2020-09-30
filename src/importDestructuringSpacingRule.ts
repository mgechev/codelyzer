import { IRuleMetadata, Replacement, RuleFailure, WalkContext } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { forEachChild, isNamedImports, NamedImports, Node, SourceFile } from 'typescript/lib/typescript';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures imports are consistent and tidy.',
    hasFix: true,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: "Imports are easier for the reader to look at when they're tidy.",
    ruleName: 'import-destructuring-spacing',
    type: 'style',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = "Import statement's curly braces must be spaced exactly by a space to the right and a space to the left";

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

const BLANK_MULTILINE_PATTERN = /^\{\s*\}$|\n/;
const LEADING_SPACES_PATTERN = /^\{(\s*)/;
const TRAILING_SPACES_PATTERN = /(\s*)}$/;

const isBlankOrMultilineImport = (value: string): boolean => BLANK_MULTILINE_PATTERN.test(value);

const getReplacements = (node: NamedImports, totalLeadingSpaces: number, totalTrailingSpaces: number): Replacement[] => {
  const nodeStartPos = node.getStart();
  const nodeEndPos = node.getEnd();
  const replacements: Replacement[] = [];
  const textToAppend = ' ';

  if (totalLeadingSpaces === 0) {
    replacements.push(Replacement.appendText(nodeStartPos + 1, textToAppend));
  } else if (totalLeadingSpaces > 1) {
    replacements.push(Replacement.deleteText(nodeStartPos + 1, totalLeadingSpaces - 1));
  }

  if (totalTrailingSpaces === 0) {
    replacements.push(Replacement.appendText(nodeEndPos - 1, textToAppend));
  } else if (totalTrailingSpaces > 1) {
    replacements.push(Replacement.deleteText(nodeEndPos - totalTrailingSpaces, totalTrailingSpaces - 1));
  }

  return replacements;
};

const validateNamedImports = (context: WalkContext, node: NamedImports): void => {
  const nodeText = node.getText();

  if (isBlankOrMultilineImport(nodeText)) return;

  const leadingSpacesMatches = nodeText.match(LEADING_SPACES_PATTERN);
  const trailingSpacesMatches = nodeText.match(TRAILING_SPACES_PATTERN);
  const totalLeadingSpaces = leadingSpacesMatches ? leadingSpacesMatches[1].length : 1;
  const totalTrailingSpaces = trailingSpacesMatches ? trailingSpacesMatches[1].length : 1;

  if (totalLeadingSpaces === 1 && totalTrailingSpaces === 1) return;

  const replacements = getReplacements(node, totalLeadingSpaces, totalTrailingSpaces);

  context.addFailureAtNode(node, Rule.FAILURE_STRING, replacements);
};

const walk = (context: WalkContext): void => {
  const { sourceFile } = context;

  const callback = (node: Node): void => {
    if (isNamedImports(node)) validateNamedImports(context, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
