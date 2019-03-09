import { RawSourceMap } from 'source-map';
import * as ts from 'typescript';

export interface CodeWithSourceMap {
  code: string;
  map?: RawSourceMap;
  source?: string;
}

export interface PropertyMetadata {
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
  constructor(
    public readonly controller: ts.ClassDeclaration,
    public readonly decorator: ts.Decorator,
    public readonly selector?: string
  ) {}
}

export class ComponentMetadata extends DirectiveMetadata {
  constructor(
    public readonly controller: ts.ClassDeclaration,
    public readonly decorator: ts.Decorator,
    public readonly selector?: string,
    public readonly animations?: (AnimationMetadata | undefined)[],
    public readonly styles?: (StyleMetadata | undefined)[],
    public readonly template?: TemplateMetadata
  ) {
    super(controller, decorator, selector);
  }
}

export class PipeMetadata {
  constructor(
    public readonly controller: ts.ClassDeclaration,
    public readonly decorator: ts.Decorator,
    public readonly name?: string,
    public readonly pure?: string
  ) {}
}

export class ModuleMetadata {
  constructor(public readonly controller: ts.ClassDeclaration, public readonly decorator: ts.Decorator) {}
}

export class InjectableMetadata {
  constructor(public readonly controller: ts.ClassDeclaration, public readonly decorator: ts.Decorator) {}
}
