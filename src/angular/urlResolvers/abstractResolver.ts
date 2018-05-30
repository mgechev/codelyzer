import * as ts from 'typescript';
import { isPropertyAssignment } from 'typescript/lib/typescript';
import { isSimpleTemplateString } from '../../util/utils';

export interface MetadataUrls {
  templateUrl: string;
  styleUrls: string[];
}

export abstract class AbstractResolver {
  abstract resolve(decorator: ts.Decorator): MetadataUrls | null;

  protected getTemplateUrl(decorator: ts.Decorator): string | null {
    const arg = this.getDecoratorArgument(decorator);

    if (!arg) {
      return null;
    }

    const prop = arg.properties
      .filter(p => (p.name as any).text === 'templateUrl' && isSimpleTemplateString((p as ts.PropertyAssignment).initializer))
      .pop();

    // We know that it's has an initializer because it's either
    // a template string or a string literal.
    return prop ? ((prop as ts.PropertyAssignment).initializer as any).text : undefined;
  }

  protected getStyleUrls(decorator: ts.Decorator): string[] {
    const arg = this.getDecoratorArgument(decorator);

    if (!arg) {
      return [];
    }

    const prop = arg.properties
      .filter(
        p => (p.name as any).text === 'styleUrls' && isPropertyAssignment(p) && p.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression
      )
      .pop();

    if (prop) {
      return ((prop as ts.PropertyAssignment).initializer as ts.ArrayLiteralExpression).elements
        .filter(e => isSimpleTemplateString(e))
        .map(e => (e as any).text);
    }

    return [];
  }

  protected getDecoratorArgument(decorator: ts.Decorator): ts.ObjectLiteralExpression | null {
    const expr = <ts.CallExpression>decorator.expression;

    if (expr && expr.arguments && expr.arguments.length) {
      const arg = expr.arguments[0] as ts.ObjectLiteralExpression;

      if (arg.properties && arg.kind === ts.SyntaxKind.ObjectLiteralExpression) {
        return arg;
      }
    }

    return null;
  }
}
