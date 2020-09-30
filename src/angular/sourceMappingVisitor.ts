import { SourceMapConsumer } from 'source-map';
import { Fix, IOptions, Replacement, RuleFailure, RuleWalker } from 'tslint';
import * as ts from 'typescript';
import { CodeWithSourceMap } from './metadata';

const LineFeed = 0x0a;
const CarriageReturn = 0x0d;
const MaxAsciiCharacter = 0x7f;
const LineSeparator = 0x2028;
const ParagraphSeparator = 0x2029;

export function isLineBreak(ch: number): boolean {
  return ch === LineFeed || ch === CarriageReturn || ch === LineSeparator || ch === ParagraphSeparator;
}

function binarySearch<T>(array: T[], value: T, comparer?: (v1: T, v2: T) => number, offset?: number): number {
  if (!array || array.length === 0) {
    return -1;
  }

  let low = offset || 0;
  let high = array.length - 1;
  comparer = comparer !== undefined ? comparer : (v1, v2) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

  while (low <= high) {
    const middle = low + ((high - low) >> 1);
    const midValue = array[middle];

    if (comparer(midValue, value) === 0) {
      return middle;
    } else if (comparer(midValue, value) > 0) {
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }

  return ~low;
}

// Apply caching and do not recompute every time
function getLineAndCharacterOfPosition(sourceFile: string, position: number): ts.LineAndCharacter {
  return computeLineAndCharacterOfPosition(computeLineStarts(sourceFile), position);
}

// Apply caching and do not recompute every time
function getPositionOfLineAndCharacter(sourceFile: string, line: number, character: number): number {
  return computePositionOfLineAndCharacter(computeLineStarts(sourceFile), line, character);
}

function computePositionOfLineAndCharacter(lineStarts: number[], line: number, character: number): number {
  return lineStarts[line] + character;
}

function computeLineAndCharacterOfPosition(lineStarts: number[], position: number): ts.LineAndCharacter {
  let lineNumber = binarySearch(lineStarts, position);
  if (lineNumber < 0) {
    lineNumber = ~lineNumber - 1;
  }
  return {
    character: position - lineStarts[lineNumber],
    line: lineNumber,
  };
}

function computeLineStarts(text: string): number[] {
  const result: number[] = [];
  let pos = 0;
  let lineStart = 0;
  while (pos < text.length) {
    const ch = text.charCodeAt(pos);
    pos++;
    switch (ch) {
      case CarriageReturn:
        if (text.charCodeAt(pos) === LineFeed) {
          pos++;
        }
      case LineFeed:
        result.push(lineStart);
        lineStart = pos;
        break;
      default:
        if (ch > MaxAsciiCharacter && isLineBreak(ch)) {
          result.push(lineStart);
          lineStart = pos;
        }
        break;
    }
  }
  result.push(lineStart);
  return result;
}

// tslint:disable-next-line: deprecation
export class SourceMappingVisitor extends RuleWalker {
  parentAST: any;
  private readonly consumer: SourceMapConsumer;

  constructor(sourceFile: ts.SourceFile, options: IOptions, public codeWithMap: CodeWithSourceMap, protected basePosition: number) {
    super(sourceFile, options);
    if (this.codeWithMap.map) {
      this.consumer = new SourceMapConsumer(this.codeWithMap.map);
    }
  }

  createFailure(s: number, l: number, message: string, fix?: Fix): RuleFailure {
    const { start, length } = this.getMappedInterval(s, l);
    // tslint:disable-next-line:deprecation
    return super.createFailure(start, length, message, fix);
  }

  createReplacement(s: number, l: number, replacement: string): Replacement {
    const { start, length } = this.getMappedInterval(s, l);
    return super.createReplacement(start, length, replacement);
  }

  getSourcePosition(pos: number): number {
    if (this.consumer) {
      try {
        let absPos = getLineAndCharacterOfPosition(this.codeWithMap.code, pos);
        const result = this.consumer.originalPositionFor({ line: absPos.line + 1, column: absPos.character + 1 });
        absPos = { line: result.line - 1, character: result.column - 1 };
        pos = getPositionOfLineAndCharacter(this.codeWithMap.source!, absPos.line, absPos.character);
      } catch (e) {
        console.error(e);
      }
    }

    if (this.parentAST && this.parentAST.templateName) {
      pos = pos - this.parentAST.value.ast.span.start;
    }
    return pos + this.basePosition;
  }

  addParentAST(parentAST: any): any {
    this.parentAST = parentAST;
    return this;
  }

  private getMappedInterval(start: number, length: number): { length: number; start: number } {
    let end = start + length;
    start = this.getSourcePosition(start);
    end = this.getSourcePosition(end);
    return { start, length: end - start };
  }
}
