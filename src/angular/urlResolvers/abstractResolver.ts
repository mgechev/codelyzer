import * as ts from 'typescript';
import { current } from '../../util/syntaxKind';
import { isSimpleTemplateString } from '../../util/utils';

const kinds = current();

export interface MetadataUrls {
  templateUrl: string;
  styleUrls: string[];
}

export abstract class AbstractResolver {
  abstract resolve(decorator: ts.Decorator): MetadataUrls;

  protected getTemplateUrl(decorator: ts.Decorator): string {
    const arg = this.getDecoratorArgument(decorator);
    if (!arg) {
      return null;
    }
    const prop = arg.properties.filter((p: ts.PropertyAssignment) => {
      if ((<any>p.name).text === 'templateUrl' && isSimpleTemplateString(p.initializer)) {
        return true;
      }
      return false;
    }).pop();
    if (prop) {
      // We know that it's has an initializer because it's either
      // a template string or a string literal.
      return (<any>(<ts.PropertyAssignment>prop).initializer).text;
    } else {
      return null;
    }
  }

  protected getStyleUrls(decorator: ts.Decorator): string[] {
    const arg = this.getDecoratorArgument(decorator);
    if (!arg) {
      return [];
    }
    const prop = arg.properties.filter((p: ts.PropertyAssignment) => {
      if ((<any>p.name).text === 'styleUrls' && p.initializer.kind === kinds.ArrayLiteralExpression) {
        return true;
      }
      return false;
    }).pop();
    if (prop) {
      return (<ts.ArrayLiteralExpression>(<ts.PropertyAssignment>prop).initializer).elements.filter((e: any) => {
        return isSimpleTemplateString(e);
      }).map((e: any) => {
        return e.text;
      });
    } else {
      return [];
    }
  }

  protected getDecoratorArgument(decorator: ts.Decorator): ts.ObjectLiteralExpression {
    const expr = <ts.CallExpression>decorator.expression;
    if (expr && expr.arguments && expr.arguments.length) {
      const arg = <ts.ObjectLiteralExpression>expr.arguments[0];
      if (arg.kind === kinds.ObjectLiteralExpression && arg.properties) {
        return arg;
      }
    }
    return null;
  }
}
