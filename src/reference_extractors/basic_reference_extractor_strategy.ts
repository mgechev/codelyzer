import * as ts from 'typescript';

import {ReferenceExtractorStrategy} from './reference_extractor_strategy';

export class BasicReferenceExtractorStrategy extends ReferenceExtractorStrategy {
  extract(nodes: ts.Identifier[], file, walkerFactory): any[] {
    return nodes.map(n => n.text);
  }
}
