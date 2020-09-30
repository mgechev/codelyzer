import { IOptions, IRuleMetadata } from 'tslint/lib';
import { dedent } from 'tslint/lib/utils';
import { MetadataPropertyBase } from './metadataPropertyBase';
import { AngularInnerClassDecorators } from './util/utils';

const METADATA_PROPERTY_NAME = 'host';
const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-06-03';

export class Rule extends MetadataPropertyBase {
  static readonly metadata: IRuleMetadata = {
    description: `Disallows usage of the \`${METADATA_PROPERTY_NAME}\` metadata property.`,
    descriptionDetails: `See more at ${STYLE_GUIDE_LINK}.`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: dedent`
      If you ever need to rename the property associated
      with @${AngularInnerClassDecorators.HostBinding} or the method associated
      with @${AngularInnerClassDecorators.HostListener}, you can modify it in a single place.
    `,
    ruleName: 'no-host-metadata-property',
    type: 'style',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = dedent`
    Use @${AngularInnerClassDecorators.HostBinding} or
    @${AngularInnerClassDecorators.HostListener} rather than the \`${METADATA_PROPERTY_NAME}\` metadata property (${STYLE_GUIDE_LINK})
  `;

  constructor(options: IOptions) {
    super(
      {
        errorMessage: Rule.FAILURE_STRING,
        propertyName: METADATA_PROPERTY_NAME,
      },
      options
    );
  }
}
