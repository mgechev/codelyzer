import 'reflect-metadata';
import {
  ComponentMetadata,
  PLATFORM_COMMON_PROVIDERS,
  Injector,
  APPLICATION_COMMON_PROVIDERS
} from 'angular2/core';
import {
  COMMON_DIRECTIVES,
  COMMON_PIPES
} from 'angular2/common';
import {TemplateParser} from 'angular2/src/compiler/template_parser';
import {COMPILER_PROVIDERS} from 'angular2/src/compiler/compiler';
import {Parse5DomAdapter} from 'angular2/src/platform/server/parse5_adapter'
import {ComponentInfo} from './walkers/base_collect_metadata_walker';
import {ComponentMetadataCollector} from './component_metadata_collector';

Parse5DomAdapter.makeCurrent();

export class TemplateValidator {
  private injector: Injector;
  private parser: TemplateParser;
  constructor() {
    this.injector = Injector.resolveAndCreate([PLATFORM_COMMON_PROVIDERS, APPLICATION_COMMON_PROVIDERS, COMPILER_PROVIDERS]);
    this.parser = this.injector.get(TemplateParser);
  }
  validate(rootFile: string) {
    let collector = new ComponentMetadataCollector();
    let tree = collector.getComponentTree(rootFile);
    tree.forEach(c => this._validateComponent(c));
  }
  private _validateComponent(component: ComponentInfo, directives = COMMON_DIRECTIVES, pipes = COMMON_PIPES) {
    let meta = component.metadata;
    if (meta instanceof ComponentMetadata) {
      directives = directives.concat(meta.directives.map(d => d.metadata));
      pipes = pipes.concat(meta.pipes.map(p => p.metadata));
      try {
        this.parser.parse(meta.template, directives, pipes, '');
      } catch (e) {
        console.log(e);
      }
    } else {
      return true;
    }
  }
}
