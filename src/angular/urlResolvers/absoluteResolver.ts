import * as ts from 'typescript';
import {AbstractResolver, MetadataUrls} from './abstractResolver';
import {join} from 'path';

export class AbsoluteResolver extends AbstractResolver {
  constructor(private basePath: string = '') {
    super();
  }

  resolve(decorator: ts.Decorator) {
    const arg = this.getDecoratorArgument(decorator);
    if (!arg) {
      return null;
    }
    let templateUrl = this.getTemplateUrl(decorator);
    if (templateUrl) {
      templateUrl = join(this.basePath, templateUrl);
    }
    return {
      templateUrl: templateUrl,
      styleUrls: this.getStyleUrls(decorator)
        .map((p: string) => join(this.basePath, p))
    };
  }
}
