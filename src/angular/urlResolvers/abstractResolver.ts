import { Decorator, isArrayLiteralExpression } from 'typescript';
import { getDecoratorPropertyInitializer, isStringLiteralLike } from '../../util/utils';

export interface MetadataUrls {
  readonly styleUrls: string[];
  readonly templateUrl: string;
}

export abstract class AbstractResolver {
  abstract resolve(decorator: Decorator): MetadataUrls | null;

  protected getTemplateUrl(decorator: Decorator): MetadataUrls['templateUrl'] | undefined {
    const templateUrlExpression = getDecoratorPropertyInitializer(decorator, 'templateUrl');

    if (!templateUrlExpression || !isStringLiteralLike(templateUrlExpression)) return undefined;

    return templateUrlExpression.text;
  }

  protected getStyleUrls(decorator: Decorator): MetadataUrls['styleUrls'] {
    const styleUrlsExpression = getDecoratorPropertyInitializer(decorator, 'styleUrls');

    if (!styleUrlsExpression || !isArrayLiteralExpression(styleUrlsExpression)) return [];

    return styleUrlsExpression.elements.filter(isStringLiteralLike).map((element) => element.text);
  }
}
