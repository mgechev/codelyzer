import * as ts from 'typescript';

export interface TemplateMetadata {
  template: string;
  node: ts.Node;
  source: string;
}

export interface StyleMetadata {
  style: string;
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

