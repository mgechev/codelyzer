import { __core_private__ as r, NO_ERRORS_SCHEMA } from '@angular/core';
import * as compiler from '@angular/compiler';

export const parseTemplate = (template: string) => {
  const _ = compiler.__compiler_private__;
  const TemplateParser = _.TemplateParser;
  const DomElementSchemaRegistry = _.DomElementSchemaRegistry;
  const expressionParser = new _.Parser(new _.Lexer());
  const elementSchemaRegistry = new DomElementSchemaRegistry();
  const ngConsole = new r.Console();
  const htmlParser =
      new compiler.I18NHtmlParser(new _.HtmlParser(), '', '');
  const tmplParser =
    new TemplateParser(expressionParser, elementSchemaRegistry, htmlParser, ngConsole, []);
  const type = new compiler.CompileTypeMetadata({ diDeps: [] });
  return tmplParser.tryParse(
      compiler.CompileDirectiveMetadata.create({ type }),
      template, [], [], [NO_ERRORS_SCHEMA], null).templateAst;
};
