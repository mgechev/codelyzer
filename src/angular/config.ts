import * as ts from 'typescript';
import {CodeWithSourceMap} from './metadata';
import {renderSync} from 'node-sass';

const root = require('app-root-path');
const join = require('path').join;

export interface UrlResolver {
  (url: string, d: ts.Decorator): string;
}

export interface TemplateTransformer {
  (template: string, url: string, d: ts.Decorator): CodeWithSourceMap;
}

export interface StyleTransformer {
  (style: string, url: string, d: ts.Decorator): CodeWithSourceMap;
}

export const LogLevel = {
  Error: 0b001,
  Info: 0b011,
  Debug: 0b111,
  None: 0
};

export interface Config {
  interpolation: [string, string];
  resolveUrl: UrlResolver;
  transformTemplate: TemplateTransformer;
  transformStyle: StyleTransformer;
  predefinedDirectives: DirectiveDeclaration[];
  logLevel: number;
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

  transformTemplate(code: string, url: string, d: ts.Decorator) {
    return { code, url };
  },

  transformStyle(code: string, url: string, d: ts.Decorator) {
    return { code, url };
  },

  predefinedDirectives: [
    { selector: 'form', exportAs: 'ngForm' }
  ],

  logLevel: LogLevel.None
};

try {
  let newConfig = require(join(root.path, '.codelyzer'));
  Object.assign(Config, newConfig);
} catch (e) {

}

