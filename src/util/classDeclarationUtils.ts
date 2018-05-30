import * as ts from 'typescript';
import { FlatSymbolTable } from '../angular/templates/recursiveAngularExpressionVisitor';

export const getDeclaredProperties = (declaration: ts.ClassDeclaration) => {
  const m = declaration.members;
  const ctr = m.filter((m: any) => m.kind === ts.SyntaxKind.Constructor).pop();
  let params: any = [];
  if (ctr) {
    params = (((<ts.ConstructorDeclaration>ctr).parameters || []) as any).filter((p: any) => p.kind === ts.SyntaxKind.Parameter);
  }
  return m
    .filter(
      (m: any) =>
        m.kind === ts.SyntaxKind.PropertyDeclaration || m.kind === ts.SyntaxKind.GetAccessor || m.kind === ts.SyntaxKind.SetAccessor
    )
    .concat(params);
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
  return declaration.members.filter(m => m.kind === ts.SyntaxKind.MethodDeclaration);
};

export const getDeclaredMethodNames = (declaration: ts.ClassDeclaration) => {
  return getDeclaredMethods(declaration)
    .map(d => (<ts.Identifier>d.name).text)
    .reduce<FlatSymbolTable>((accum, m) => {
      accum[m] = true;
      return accum;
    }, {});
};
