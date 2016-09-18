import * as ts from 'typescript';
import { current } from './syntax-kind';

const SyntaxKind = current();

export const getDeclaredPropertyNames = (declaration: ts.ClassDeclaration) => {
  return declaration.members.filter((m: any) => m.kind === SyntaxKind.PropertyDeclaration)
    .map((d: any) => (<ts.Identifier>d.name).text);
};

export const getDeclaredMethodNames = (declaration: ts.ClassDeclaration) => {
  return declaration.members.filter((m: any) => m.kind === SyntaxKind.MethodDeclaration)
    .map((d: any) => (<ts.Identifier>d.name).text);
};
