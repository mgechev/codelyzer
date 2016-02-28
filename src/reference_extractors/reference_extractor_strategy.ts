import * as ts from 'typescript';

export abstract class ReferenceExtractorStrategy {
  abstract extract(nodes: ts.Identifier[], file: ts.SourceFile, walkerFactory: Function): any[];
}
