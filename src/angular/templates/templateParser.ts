import { __core_private__ as r, NO_ERRORS_SCHEMA } from '@angular/core';
import { Config } from '../config';
import * as compiler from '@angular/compiler';

let refId = 0;

const dummyMetadataFactory = (selector: string, exportAs: string) => {
  if (refId > 1e10) {
    refId = 0;
  }
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
      isHost: false,
      reference: ++refId + '-ref'
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

let defaultDirectives = [];

export const parseTemplate = (template: string, directives: { selector: string, exportAs: string }[] = []) => {
  defaultDirectives = directives.map(d => dummyMetadataFactory(d.selector, d.exportAs));

  const TemplateParser = <any>compiler.TemplateParser;
  const expressionParser = new compiler.Parser(new compiler.Lexer());
  const elementSchemaRegistry = new compiler.DomElementSchemaRegistry();
  const ngConsole = new r.Console();
  const htmlParser =
      new compiler.I18NHtmlParser(new compiler.HtmlParser());
  const tmplParser =
    new TemplateParser(expressionParser, elementSchemaRegistry, htmlParser, ngConsole, []);
  const interpolation = Config.interpolation;
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
