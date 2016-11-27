import * as ts from 'typescript';
import {RuleWalker, RuleFailure, IOptions} from 'tslint';
import {ComponentMetadata, CodeWithSourceMap} from './metadata';
import {SourceMapConsumer} from 'source-map';

const findLineAndColumnNumber = (pos: number, code: string) => {
  code = code.replace('\r\n', '\n').replace('\r', '\n');
  let line = 1;
  let column = 0;
  for (let i = 0; i < pos; i += 1) {
    column += 1;
    if (code[i] === '\n') {
      line += 1;
      column = 0;
    }
  }
  return { line, column };
};

const findCharNumberFromLineAndColumn = ({ line, column }: { line: number, column: number }, code: string) => {
  code = code.replace('\r\n', '\n').replace('\r', '\n');
  let char = 0;
  while (line) {
    if (code[char] === '\n') {
      line -= 1;
    }
    char += 1;
  }
  return char + column;
};

export class SourceMappingVisitor extends RuleWalker {

  constructor(sourceFile: ts.SourceFile, options: IOptions, protected codeWithMap: CodeWithSourceMap, protected basePosition: number) {
    super(sourceFile, options);
  }

  createFailure(start: number, length: number, message: string): RuleFailure {
    let end = start + length;
    if (this.codeWithMap.map) {
      const consumer = new SourceMapConsumer(this.codeWithMap.map);
      start = this.getMappedPosition(start, consumer);
      end = this.getMappedPosition(end, consumer);
    } else {
      start += this.basePosition;
      end = start + length;
    }
    return super.createFailure(start, end - start, message);
  }

  private getMappedPosition(pos: number, consumer: SourceMapConsumer) {
    const absPos = findLineAndColumnNumber(pos, this.codeWithMap.code);
    const mappedPos = consumer.originalPositionFor(absPos);
    const char = findCharNumberFromLineAndColumn(mappedPos, this.codeWithMap.source);
    return char + this.basePosition;
  }
}
