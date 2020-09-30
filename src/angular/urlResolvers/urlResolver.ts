import * as ts from 'typescript';

import { Config } from '../config';
import { AbstractResolver, MetadataUrls } from './abstractResolver';
import { dirname } from 'path';
import { PathResolver } from './pathResolver';

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
        templateUrl: Config.resolveUrl(this.pathResolver.resolve(templateUrl!, componentPath))!,
        styleUrls: styleUrls.map((p: string) => {
          return Config.resolveUrl(this.pathResolver.resolve(p, componentPath))!;
        }),
      };
    }

    return {
      templateUrl: Config.resolveUrl(null)!,
      styleUrls: [],
    };
  }

  private getProgramFilePath(d: any) {
    let current = d;

    while (current) {
      if (current.kind === ts.SyntaxKind.SourceFile) {
        return current.path || current.fileName;
      }

      current = current.parent;
    }

    return undefined;
  }
}
