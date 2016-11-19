import * as ts from 'typescript';

import {Config} from '../config';
import {AbstractResolver, MetadataUrls} from './abstractResolver';

import {CommonJsResolver} from './commonJsResolver';
import {AbsoluteResolver} from './absoluteResolver';

export class UrlResolver extends AbstractResolver {

  private resolvers = [
    new CommonJsResolver(),
    new AbsoluteResolver(Config.basePath)
  ];

  resolve(d: ts.Decorator) {
    let result: MetadataUrls = null;
    for (let i = 0; i < this.resolvers.length; i += 1) {
      const resolver = this.resolvers[i];
      result = resolver.resolve(d);
      if (result) {
        break;
      }
    }
    result.templateUrl = Config.resolveUrl(result.templateUrl, d);
    result.styleUrls = result.styleUrls.map((s: string) => {
      return Config.resolveUrl(s, d);
    });
    return result;
  }
}

