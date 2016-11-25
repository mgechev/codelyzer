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

export interface Config {
  interpolation: [string, string];
  resolveUrl: UrlResolver;
  transformTemplate: TemplateTransformer;
  transformStyle: StyleTransformer;
  predefinedDirectives: DirectiveDeclaration[];
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
    return { code };
  },

  transformStyle(code: string, url: string, d: ts.Decorator) {
    let result: CodeWithSourceMap = { source: code, code };
    if (url && (url.endsWith('.sass') || url.endsWith('.scss'))) {
      // Note: it's not written on disk
      // https://github.com/sass/node-sass#outfile
      let res = renderSync({ file: url, data: code, sourceMap: true, outFile: url });
      result.map = JSON.parse(res.map.toString());
      result.code = res.css.toString();
    }
    return { code };
  },

  predefinedDirectives: [
    { selector: 'form', exportAs: 'ngForm' }
  ]
};

try {
  let newConfig = require(join(root.path, '.codelyzer'));
  Object.assign(Config, newConfig);
} catch (e) {

}

