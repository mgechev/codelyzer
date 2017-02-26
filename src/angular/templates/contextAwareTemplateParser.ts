import {ProjectSymbols, ContextSymbols, DirectiveSymbol} from 'ngast';
import {readFileSync} from 'fs';
import * as ts from 'typescript';

let projectSymbols: ProjectSymbols = undefined;
let lastProgram: ts.Program;
let contexts: ContextSymbols[];

export const parseTemplate = (declaration: ts.ClassDeclaration, fileName: string, program: ts.Program) => {
  if (!projectSymbols || lastProgram !== program) {
    projectSymbols = new ProjectSymbols({
      create() {
        return program;
      }
    }, {
      get(path: string) {
        return Promise.resolve(null);
      },
      getSync(path: string) {
        return readFileSync(path, { encoding: 'utf-8' });
      }
    });
    contexts = projectSymbols.getLazyLoadedContexts().concat(projectSymbols.getRootContext());
  }
  let directive: DirectiveSymbol;
  for (let i = 0; i < contexts.length && !directive; i += 1) {
    directive = contexts[i].getDirectiveFromNode(declaration, fileName);
  }
  if (directive) {
    return directive.getTemplateAst().templateAst;
  } else {
    return undefined;
  }
};
