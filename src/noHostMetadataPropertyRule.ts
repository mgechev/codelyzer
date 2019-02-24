import { IOptions, IRuleMetadata } from 'tslint/lib';
import { UsePropertyDecorator } from './propertyDecoratorBase';
import { Decorators } from './util/utils';

const METADATA_PROPERTY_NAME = 'host';
const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-06-03';

export class Rule extends UsePropertyDecorator {
  static readonly metadata: IRuleMetadata = {
    description: `Disallows usage of the \`${METADATA_PROPERTY_NAME}\` metadata property.`,
    descriptionDetails: `See more at ${STYLE_GUIDE_LINK}.`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: `If you ever need to rename the property associated with @${Decorators.HostBinding} or the method associated with
    @${Decorators.HostListener}, you can modify it in a single place.`,
    ruleName: 'no-host-metadata-property',
    type: 'style',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = `Use @${Decorators.HostBinding} or @${
    Decorators.HostListener
  } rather than the \`${METADATA_PROPERTY_NAME}\` metadata property (${STYLE_GUIDE_LINK})`;

  constructor(options: IOptions) {
    super(
      {
        decoratorName: [`${Decorators.HostBinding}s`, `${Decorators.HostListener}s`],
        errorMessage: Rule.FAILURE_STRING,
        propertyName: METADATA_PROPERTY_NAME
      },
      options
    );
  }
}
