import { RawSourceMap } from 'source-map';
import * as ts from 'typescript';

export interface CodeWithSourceMap {
  code: string;
  map?: RawSourceMap;
  source?: string;
}

interface PropertyMetadata {
  node?: ts.Node;
  url?: string;
}

export interface AnimationMetadata extends PropertyMetadata {
  animation: CodeWithSourceMap;
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
  animations!: AnimationMetadata[];
  styles!: StyleMetadata[];
  template!: TemplateMetadata;
}
