import * as ts from 'typescript';
import {current} from '../../util/syntaxKind';

import {AbstractResolver, MetadataUrls} from './abstractResolver';
import {dirname, join} from 'path';

const kinds = current();

const getProgramFilePath = (d: any) => {
  let current: any = d;
  while (current) {
    if (current.kind === kinds.SourceFile) {
      return current.path || current.fileName;
    }
    current = current.parent;
  }
  return undefined;
};

export class CommonJsResolver extends AbstractResolver {

  resolve(decorator: ts.Decorator) {
    const arg = this.getDecoratorArgument(decorator);
    if (!arg) {
      return null;
    }
    const prop = arg.properties.filter((p: ts.PropertyAssignment) => {
      if ((<any>p.name).text === 'moduleId') {
        return true;
      }
      return false;
    }).pop();
    if (!prop) {
      return null;
    }
    const i = (<any>prop).initializer;
    if (i && i.kind === kinds.PropertyAccessExpression &&
        i.expression && i.expression.text === 'module' &&
        i.name && i.name.text === 'id') {
      const path = getProgramFilePath(decorator);
      const dir = dirname(path);
      return {
        templateUrl: join(dir, this.getTemplateUrl(decorator)),
        styleUrls: this.getStyleUrls(decorator)
          .map((p: string) => join(dir, p))
      };
    } else {
      return null;
    }
  }
}

