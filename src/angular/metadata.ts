import * as ts from 'typescript';
import {CodeWithSourceMap} from 'source-map';

export interface TemplateMetadata {
  template: CodeWithSourceMap;
  node: ts.Node;
  source: string;
}

export interface StyleMetadata {
  style: CodeWithSourceMap;
  node: ts.Node;
  source: string;
}

export interface StylesMetadata {
  [index: number]: StyleMetadata;
  length: number;
  push(e: StyleMetadata): number;
}

export class DirectiveMetadata {
  selector: string;
  controller: ts.ClassDeclaration;
  decorator: ts.Decorator;
}

export class ComponentMetadata extends DirectiveMetadata {
  template: TemplateMetadata;
  styles: StylesMetadata;
}

