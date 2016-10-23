import * as ts from 'typescript';
import { current } from './syntaxKind';

const SyntaxKind = current();

export const getDeclaredPropertyNames = (declaration: ts.ClassDeclaration) => {
  return declaration.members.filter((m: any) => m.kind === SyntaxKind.PropertyDeclaration ||
    m.kind === SyntaxKind.GetAccessor || m.kind === SyntaxKind.SetAccessor)
    .map((d: any) => (<ts.Identifier>d.name).text);
};

export const getDeclaredMethodNames = (declaration: ts.ClassDeclaration) => {
  return declaration.members.filter((m: any) => m.kind === SyntaxKind.MethodDeclaration)
    .map((d: any) => (<ts.Identifier>d.name).text);
};
