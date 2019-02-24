import { IOptions, IRuleMetadata } from 'tslint/lib';
import { dedent } from 'tslint/lib/utils';
import { UsePropertyDecorator } from './propertyDecoratorBase';
import { Decorators } from './util/utils';

const METADATA_PROPERTY_NAME = 'outputs';
const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-05-12';

export class Rule extends UsePropertyDecorator {
  static readonly metadata: IRuleMetadata = {
    description: `Disallows usage of the \`${METADATA_PROPERTY_NAME}\` metadata property.`,
    descriptionDetails: `See more at ${STYLE_GUIDE_LINK}.`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: dedent`
      * It is easier and more readable to identify which properties in a class are events.
      * If you ever need to rename the event associated with @${Decorators.Output}, you can modify it in a single place.
      * The metadata declaration attached to the directive is shorter and thus more readable.
    `,
    ruleName: 'no-outputs-metadata-property',
    type: 'style',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = `Use @${
    Decorators.Output
  } rather than the \`${METADATA_PROPERTY_NAME}\` metadata property (${STYLE_GUIDE_LINK})`;

  constructor(options: IOptions) {
    super(
      {
        decoratorName: Decorators.Output,
        errorMessage: Rule.FAILURE_STRING,
        propertyName: METADATA_PROPERTY_NAME
      },
      options
    );
  }
}
