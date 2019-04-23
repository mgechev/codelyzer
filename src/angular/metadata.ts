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
  constructor(readonly controller: ts.ClassDeclaration, readonly decorator: ts.Decorator, readonly selector?: string) {}
}

export class ComponentMetadata extends DirectiveMetadata {
  constructor(
    readonly controller: ts.ClassDeclaration,
    readonly decorator: ts.Decorator,
    readonly selector?: string,
    readonly animations?: (AnimationMetadata | undefined)[],
    readonly styles?: (StyleMetadata | undefined)[],
    readonly template?: TemplateMetadata
  ) {
    super(controller, decorator, selector);
  }
}

export class PipeMetadata {
  constructor(
    readonly controller: ts.ClassDeclaration,
    readonly decorator: ts.Decorator,
    readonly name?: string,
    readonly pure?: ts.BooleanLiteral
  ) {}
}

export class ModuleMetadata {
  constructor(readonly controller: ts.ClassDeclaration, readonly decorator: ts.Decorator) {}
}

export class InjectableMetadata {
  constructor(readonly controller: ts.ClassDeclaration, readonly decorator: ts.Decorator, readonly providedIn?: string | ts.Expression) {}
}
