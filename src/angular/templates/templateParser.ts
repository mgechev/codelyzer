import { __core_private__ as r, NO_ERRORS_SCHEMA } from '@angular/core';
import { INTERPOLATION } from '../config';
import * as compiler from '@angular/compiler';

const dummyMetadataFactory = (selector: string, exportAs: string) => {
  return {
    inputs: {},
    outputs: {},
    hostListeners: {},
    hostProperties: {},
    hostAttributes: {},
    isSummary: true,
    type: {
      diDeps: [],
      lifecycleHooks: [],
      isHost: false
    },
    isComponent: false,
    selector,
    exportAs,
    providers: [],
    viewProviders: [],
    queries: [],
    entryComponents: [],
    changeDetection: 0,
    template: {
      isSummary: true,
      animations: [],
      ngContentSelectors: [],
      encapsulation: 0
    }
  };
};

const defaultDirectives = [
  dummyMetadataFactory('form', 'ngForm')
];

export const parseTemplate = (template: string, directives: { selector: string, exportAs: string }[] = []) => {
  directives.forEach(d =>
    this.defaultDirectives.push(dummyMetadataFactory(d.selector, d.exportAs)));

  const TemplateParser = <any>compiler.TemplateParser;
  const expressionParser = new compiler.Parser(new compiler.Lexer());
  const elementSchemaRegistry = new compiler.DomElementSchemaRegistry();
  const ngConsole = new r.Console();
  const htmlParser =
      new compiler.I18NHtmlParser(new compiler.HtmlParser());
  const tmplParser =
    new TemplateParser(expressionParser, elementSchemaRegistry, htmlParser, ngConsole, []);
  const interpolation = INTERPOLATION;
  const templateMetadata: compiler.CompileTemplateMetadata = {
    encapsulation: 0,
    template: template,
    templateUrl: '',
    styles: [],
    styleUrls: [],
    ngContentSelectors: [],
    animations: [],
    externalStylesheets: [],
    interpolation,
    toSummary() {
      return {
        isSummary: true,
        animations: this.animations.map(anim => anim.name),
        ngContentSelectors: this.ngContentSelectors,
        encapsulation: this.encapsulation
      };
    }
  };
  const type = new compiler.CompileTypeMetadata({ diDeps: [] });
  return tmplParser.tryParse(
      compiler.CompileDirectiveMetadata.create({ type, template: templateMetadata }),
      template, defaultDirectives, [], [NO_ERRORS_SCHEMA], '').templateAst;
};
