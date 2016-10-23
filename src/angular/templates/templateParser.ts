import { __core_private__ as r, NO_ERRORS_SCHEMA } from '@angular/core';
import { INTERPOLATION } from '../config';
import * as compiler from '@angular/compiler';

export const parseTemplate = (template: string) => {
  const TemplateParser = compiler.TemplateParser;
  const expressionParser = new compiler.Parser(new compiler.Lexer());
  const elementSchemaRegistry = new compiler.DomElementSchemaRegistry();
  const ngConsole = new r.Console();
  const htmlParser =
      new compiler.I18NHtmlParser(new compiler.HtmlParser());
  const tmplParser =
    new TemplateParser(expressionParser, elementSchemaRegistry, htmlParser, ngConsole, []);
  const interpolation = INTERPOLATION;
  const templateMetadata = {
    encapsulation: 0,
    template: template,
    templateUrl: '',
    styles: [],
    styleUrls: [],
    ngContentSelectors: [],
    animations: [],
    externalStylesheets: [],
    interpolation
  };
  const type = new compiler.CompileTypeMetadata({ diDeps: [] });
  return tmplParser.tryParse(
      compiler.CompileDirectiveMetadata.create({ type, template: templateMetadata }),
      template, [], [], [NO_ERRORS_SCHEMA], '').templateAst;
};
