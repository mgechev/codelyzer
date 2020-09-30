import * as ts from 'typescript';
import { FlatSymbolTable } from '../angular/templates/recursiveAngularExpressionVisitor';

export const getDeclaredProperties = (declaration: ts.ClassDeclaration) => {
  const { members } = declaration;
  const ctr = members.find(ts.isConstructorDeclaration);
  const params = (ctr ? ctr.parameters.filter(ts.isParameter) : []) as any;

  return members.filter((x) => ts.isPropertyDeclaration(x) || ts.isGetAccessor(x) || ts.isSetAccessor(x)).concat(params);
};

export const getDeclaredPropertyNames = (declaration: ts.ClassDeclaration) => {
  return getDeclaredProperties(declaration)
    .filter((p) => p.name && ts.isIdentifier(p.name))
    .map((p) => (p.name as ts.Identifier).text)
    .reduce<FlatSymbolTable>((accum, p) => {
      accum[p] = true;
      return accum;
    }, {});
};

export const getDeclaredMethods = (declaration: ts.ClassDeclaration) => {
  return declaration.members.filter(ts.isMethodDeclaration);
};

export const getDeclaredMethodNames = (declaration: ts.ClassDeclaration) => {
  return getDeclaredMethods(declaration)
    .map((d) => (d.name as ts.Identifier).text)
    .reduce<FlatSymbolTable>((accum, m) => {
      accum[m] = true;
      return accum;
    }, {});
};
