import * as Lint from 'tslint';

import { UsePropertyDecorator } from './propertyDecoratorBase';
import { IOptions } from 'tslint';

export class Rule extends UsePropertyDecorator {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'use-output-property-decorator',
    type: 'style',
    description: `Use \`@Output\` decorator rather than the \`outputs\` property of \`@Component\` and \`@Directive\` metadata.`,
    descriptionDetails: `See more at https://angular.io/styleguide#style-05-12.`,
    rationale: Lint.Utils.dedent`
    * It is easier and more readable to identify which properties in a class are events.
    * If you ever need to rename the event name associated with \`@Output\`, you can modify it in a single place.
    * The metadata declaration attached to the directive is shorter and thus more readable.
    * Placing the decorator on the same line usually makes for shorter code and still easily identifies the property as an output.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };


  constructor(options: IOptions) {
    super({
      decoratorName: 'Output',
      propertyName: 'outputs',
      errorMessage: 'Use the @Output property decorator instead of the outputs property (https://angular.io/styleguide#style-05-12)'
    }, options);
  }
}
