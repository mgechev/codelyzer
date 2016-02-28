import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import {SyntaxWalker} from './syntax_walker';
import {ReferenceExtractorStrategy} from '../reference_extractors/reference_extractor_strategy';
import {BasicReferenceExtractorStrategy} from '../reference_extractors/basic_reference_extractor_strategy';

export abstract class BaseCollectMetadataWalker<T> extends SyntaxWalker {
  constructor(protected referenceExtractorStrategy: ReferenceExtractorStrategy = new BasicReferenceExtractorStrategy()) {
    super();
  }
  abstract getMetadata(file, names?: string[]): T[];
}

export const classMetadataValueExtracter = {
  selector: getPropValue,
  inputs: getArrayLiteralValue,
  outputs: getArrayLiteralValue,
  host: getObjectLiteralValue,
  templateUrl: getExternalFileFromLiteral,
  // for pipes
  name: getPropValue
};

export const PROP_MAP = {
  outputs: '_events',
  events: '_events',
  inputs: '_properties',
  properties: '_properties',
  host: 'host',
  selector: 'selector',
  directives: 'directives',
  pipes: 'pipes',
  templateUrl: 'template',
  // for pipes
  name: 'name'
};

function getPropValue(p) {
  if (p.initializer.kind === ts.SyntaxKind.StringLiteral) {
    return p.initializer.text;
  }
  return null;
}

function getArrayLiteralValue(n) {
  if (n.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
    return n.initializer.elements.map(e => e.text);
  }
  return null;
}


function getObjectLiteralValue(n) {
  if (n.initializer.kind === ts.SyntaxKind.ObjectLiteralExpression) {
    return n.initializer.properties.reduce((p, c) => {
      p[c.name.text] = c.initializer.text;
      return p;
    }, {});
  }
  return null;
}

function getExternalFileFromLiteral(n) {
  return fs.readFileSync(path.join(__dirname, getPropValue(n))).toString();
}
