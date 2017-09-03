import { CssParser } from './cssParser';
import { CssAst } from './cssAst';

export const parseCss = (text: string): CssAst => {
  const parser = new CssParser();
  return parser.parse(text, '').ast;
};
