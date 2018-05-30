import * as ts from 'typescript';
import { RawSourceMap } from 'source-map';

export interface CodeWithSourceMap {
  code: string;
  map?: RawSourceMap;
  source?: string;
}

interface PropertyMetadata {
  node?: ts.Node;
  url?: string;
}

export interface StyleMetadata extends PropertyMetadata {
  style: CodeWithSourceMap;
}

export interface TemplateMetadata extends PropertyMetadata {
  template: CodeWithSourceMap;
}

export class DirectiveMetadata {
  controller!: ts.ClassDeclaration;
  decorator!: ts.Decorator;
  selector!: string;
}

export class ComponentMetadata extends DirectiveMetadata {
  styles!: StyleMetadata[];
  template!: TemplateMetadata;
}
