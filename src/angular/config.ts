import * as ts from 'typescript';

const root = require('app-root-path');
const join = require('path').join;

export interface UrlResolver {
  (url: string, d: ts.Decorator): string;
}

export interface Config {
  interpolation: [string, string];
  resolveUrl: UrlResolver;
  predefinedDirectives: DirectiveDeclaration[];
  basePath: string;
}

export interface DirectiveDeclaration {
  selector: string;
  exportAs: string;
}

export let Config: Config = {
  interpolation: ['{{', '}}'],
  resolveUrl(url: string, d: ts.Decorator) {
    return url;
  },
  predefinedDirectives: [
    { selector: 'form', exportAs: 'ngForm' }
  ],
  basePath: ''
};

try {
  let newConfig = require(join(root, '.codelyzer'));
  Object.assign(Config, newConfig);
} catch (e) {

}

