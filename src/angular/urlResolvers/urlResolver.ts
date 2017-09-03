import * as ts from 'typescript';

import { Config } from '../config';
import { AbstractResolver, MetadataUrls } from './abstractResolver';
import { dirname } from 'path';
import { current } from '../../util/syntaxKind';
import { PathResolver } from './pathResolver';

const kinds = current();

export class UrlResolver extends AbstractResolver {

  constructor(private pathResolver: PathResolver) {
    super();
  }

  resolve(d: ts.Decorator): MetadataUrls {
    const templateUrl = this.getTemplateUrl(d);
    const styleUrls = this.getStyleUrls(d);
    const targetPath = this.getProgramFilePath(d);
    if (targetPath) {
      const componentPath = dirname(targetPath);
      return {
        templateUrl: Config.resolveUrl(this.pathResolver.resolve(templateUrl, componentPath), d),
        styleUrls: styleUrls.map((p: string) => {
          return Config.resolveUrl(this.pathResolver.resolve(p, componentPath), d);
        })
      };
    } else {
      return {
        templateUrl: Config.resolveUrl(null, d),
        styleUrls: []
      };
    }
  }

  private getProgramFilePath(d: any) {
    let current: any = d;
    while (current) {
      if (current.kind === kinds.SourceFile) {
        return current.path || current.fileName;
      }
      current = current.parent;
    }
    return undefined;
  }
}
