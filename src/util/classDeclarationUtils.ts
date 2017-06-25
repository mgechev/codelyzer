import * as ts from 'typescript';
import { current } from './syntaxKind';
import { FlatSymbolTable } from '../angular/templates/recursiveAngularExpressionVisitor';

const SyntaxKind = current();

export const getDeclaredProperties = (declaration: ts.ClassDeclaration) => {
  const m = declaration.members;
  const ctr = m.filter((m: any) => m.kind === SyntaxKind.Constructor).pop();
  let params: any = [];
  if (ctr) {
    params = (((<ts.ConstructorDeclaration> ctr).parameters || []) as any)
      .filter((p: any) => p.kind === SyntaxKind.Parameter);
  }
  return m.filter((m: any) => m.kind === SyntaxKind.PropertyDeclaration ||
    m.kind === SyntaxKind.GetAccessor || m.kind === SyntaxKind.SetAccessor).concat(params);
};

export const getDeclaredPropertyNames = (declaration: ts.ClassDeclaration) => {
  return getDeclaredProperties(declaration)
    .filter((p: any) => p && p.name)
    .reduce((accum: FlatSymbolTable, p: any) => {
      accum[p.name.text] = true;
      return accum;
    }, {});
};

export const getDeclaredMethods = (declaration: ts.ClassDeclaration) => {
  return declaration.members.filter((m: any) => m.kind === SyntaxKind.MethodDeclaration);
};

export const getDeclaredMethodNames = (declaration: ts.ClassDeclaration) => {
  return getDeclaredMethods(declaration)
    .map((d: any) => (<ts.Identifier> d.name).text)
    .reduce((accum: FlatSymbolTable, m: string) => {
      accum[m] = true;
      return accum;
    }, {});
};

