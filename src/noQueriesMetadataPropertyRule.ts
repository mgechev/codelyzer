import { IOptions, IRuleMetadata } from 'tslint/lib';
import { MetadataPropertyBase } from './metadataPropertyBase';
import { Decorators } from './util/utils';

const METADATA_PROPERTY_NAME = 'queries';

export class Rule extends MetadataPropertyBase {
  static readonly metadata: IRuleMetadata = {
    description: `Disallows usage of the \`${METADATA_PROPERTY_NAME}\` metadata property.`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: `If you ever need to rename the property associated with @${Decorators.ContentChild}, @${Decorators.ContentChildren}, @${
      Decorators.ViewChild
    } or @${Decorators.ViewChildren}, you can modify it in a single place.`,
    ruleName: 'no-queries-metadata-property',
    type: 'style',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = `Use @${Decorators.ContentChild}, @${Decorators.ContentChildren}, @${Decorators.ViewChild} or @${
    Decorators.ViewChildren
  } rather than the \`${METADATA_PROPERTY_NAME}\` metadata property`;

  constructor(options: IOptions) {
    super(
      {
        errorMessage: Rule.FAILURE_STRING,
        propertyName: METADATA_PROPERTY_NAME
      },
      options
    );
  }
}
