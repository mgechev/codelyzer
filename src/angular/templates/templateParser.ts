import { NO_ERRORS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
import * as compiler from '@angular/compiler';

import { Config, DirectiveDeclaration } from '../config';
import { SemVerDSL } from '../../util/ngVersion';

let refId = 0;

const dummyMetadataFactory = (declaration: DirectiveDeclaration) => {
  if (refId > 1e10) {
    refId = 0;
  }
  return {
    inputs: declaration.inputs || [],
    outputs: declaration.outputs || [],
    hostListeners: declaration.hostListeners || [],
    hostProperties: declaration.hostProperties || [],
    hostAttributes: declaration.hostAttributes || [],
    isSummary: true,
    type: {
      diDeps: [],
      lifecycleHooks: [],
      isHost: false,
      reference: ++refId + '-ref',
    },
    isComponent: false,
    selector: declaration.selector,
    exportAs: declaration.exportAs,
    providers: [],
    viewProviders: [],
    queries: [],
    entryComponents: [],
    changeDetection: 0,
    template: {
      isSummary: true,
      animations: [],
      ngContentSelectors: [],
      encapsulation: 0,
    },
  };
};

class Console {
  log(message: string) {}
  warn(message: string) {}
}

let defaultDirectives: DirectiveDeclaration[] = [];

export const parseTemplate = (template: string, directives: DirectiveDeclaration[] = []) => {
  defaultDirectives = directives.map((d) => dummyMetadataFactory(d));

  const TemplateParser = compiler.TemplateParser as any;
  const expressionParser = new compiler.Parser(new compiler.Lexer());
  const elementSchemaRegistry = new compiler.DomElementSchemaRegistry();
  const ngConsole = new Console();
  const htmlParser = new compiler.HtmlParser();

  let tmplParser: any;

  SemVerDSL.gte('4.0.0-beta.8', () => {
    const config = new compiler.CompilerConfig({});
    tmplParser = new TemplateParser(config, expressionParser, elementSchemaRegistry, htmlParser, ngConsole, []);
  })
    .elseIf.lt('4.1.0', () => {
      tmplParser = new TemplateParser(expressionParser, elementSchemaRegistry, htmlParser, ngConsole, []);
    })
    .elseIf.lt('5.0.0-rc.0', () => {
      const config = new compiler.CompilerConfig({});
      tmplParser = new TemplateParser(
        config,
        new (compiler as any).JitReflector(),
        expressionParser,
        elementSchemaRegistry,
        htmlParser,
        ngConsole,
        []
      );
    })
    .else(() => {
      const JitReflector = require('./jitReflector').JitReflector;
      const config = new compiler.CompilerConfig({});
      tmplParser = new compiler.TemplateParser(
        config,
        new JitReflector(),
        expressionParser,
        elementSchemaRegistry,
        htmlParser as any,
        ngConsole,
        []
      );
    });

  const { interpolation } = Config;

  // Make sure it works with 2.2.x & 2.3.x
  const summaryKind = ((compiler as any).CompileSummaryKind || {}).Template;
  let templateMetadata: any = {
    encapsulation: 0,
    template: template,
    templateUrl: '',
    styles: [],
    isInline: true,
    styleUrls: [],
    ngContentSelectors: [],
    animations: [],
    externalStylesheets: [],
    interpolation,
    toSummary() {
      return {
        isSummary: true,
        animations: this.animations.map((anim) => anim.name),
        ngContentSelectors: this.ngContentSelectors,
        encapsulation: this.encapsulation,
        summaryKind: summaryKind,
      };
    },
  };

  // Make sure it works with 2.2.x & 2.3.x
  const type = {
    diDeps: [],
    lifecycleHooks: [],
    reference: null,

    // Used by Angular 2.2.x
    isHost: false,
    name: '',
    prefix: '',
    moduleUrl: '',
    value: '',
    identifier: null,
  };
  let result;
  try {
    SemVerDSL.lt('4.1.0', () => {
      result = tmplParser.tryParse(
        (compiler.CompileDirectiveMetadata as any).create({
          type,
          template: templateMetadata,
        }),
        template,
        defaultDirectives,
        [],
        [NO_ERRORS_SCHEMA],
        ''
      ).templateAst;
    })
      .elseIf.lt('4.1.3', () => {
        result = tmplParser.tryParse(
          compiler.CompileDirectiveMetadata.create({
            type,
            template: templateMetadata,
            isHost: true,
            isComponent: true,
            selector: '',
            exportAs: '',
            changeDetection: ChangeDetectionStrategy.Default,
            inputs: [],
            outputs: [],
            host: {},
            providers: [],
            viewProviders: [],
            queries: [],
            viewQueries: [],
            entryComponents: [],
            guards: [],
            componentViewType: null,
            rendererType: null,
            componentFactory: null,
          }),
          template,
          defaultDirectives,
          [],
          [NO_ERRORS_SCHEMA],
          ''
        ).templateAst;
      })
      .elseIf.lt('5.0.0-rc.0', () => {
        result = tmplParser.tryParse(
          compiler.CompileDirectiveMetadata.create({
            type,
            template: templateMetadata,
            isHost: true,
            isComponent: true,
            selector: '',
            exportAs: '',
            changeDetection: ChangeDetectionStrategy.Default,
            inputs: [],
            outputs: [],
            host: {},
            providers: [],
            viewProviders: [],
            queries: [],
            viewQueries: [],
            entryComponents: [],
            guards: [],
            componentViewType: null,
            rendererType: null,
            componentFactory: null,
          }),
          template,
          defaultDirectives,
          [],
          [NO_ERRORS_SCHEMA],
          ''
        ).templateAst;
      })
      .elseIf.lt('5.2.0', () => {
        result = tmplParser.tryParse(
          compiler.CompileDirectiveMetadata.create({
            type,
            template: templateMetadata,
            isHost: true,
            isComponent: true,
            selector: '',
            exportAs: '',
            changeDetection: ChangeDetectionStrategy.Default,
            inputs: [],
            outputs: [],
            host: {},
            providers: [],
            viewProviders: [],
            queries: [],
            viewQueries: [],
            entryComponents: [],
            guards: [],
            componentViewType: null,
            rendererType: null,
            componentFactory: null,
          }),
          template,
          defaultDirectives,
          [],
          [NO_ERRORS_SCHEMA],
          '',
          true
        ).templateAst;
      })
      .else(() => {
        result = tmplParser.tryParse(
          compiler.CompileDirectiveMetadata.create({
            type,
            template: templateMetadata,
            isHost: true,
            isComponent: true,
            selector: '',
            exportAs: '',
            changeDetection: ChangeDetectionStrategy.Default,
            inputs: [],
            outputs: [],
            host: {},
            providers: [],
            viewProviders: [],
            queries: [],
            viewQueries: [],
            entryComponents: [],
            componentViewType: null,
            rendererType: null,
            componentFactory: null,
            guards: {},
          }),
          template,
          defaultDirectives,
          [],
          [NO_ERRORS_SCHEMA],
          '',
          true
        ).templateAst;
      });
  } catch (e) {
    console.error(e);
  }
  return result;
};
