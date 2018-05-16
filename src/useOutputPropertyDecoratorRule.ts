import * as Lint from 'tslint';
import { UsePropertyDecorator } from './propertyDecoratorBase';

export class Rule extends UsePropertyDecorator {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Use `@Output` decorator rather than the `outputs` property of `@Component` and `@Directive` metadata.',
    descriptionDetails: 'See more at https://angular.io/styleguide#style-05-12.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: Lint.Utils.dedent`
      * It is easier and more readable to identify which properties in a class are events.
      * If you ever need to rename the event name associated with \`@Output\`, you can modify it in a single place.
      * The metadata declaration attached to the directive is shorter and thus more readable.
      * Placing the decorator on the same line usually makes for shorter code and still easily identifies the property as an output.
    `,
    ruleName: 'use-output-property-decorator',
    type: 'style',
    typescriptOnly: true
  };

  constructor(options: Lint.IOptions) {
    super(
      {
        decoratorName: 'Output',
        errorMessage: 'Use the @Output property decorator instead of the outputs property (https://angular.io/styleguide#style-05-12)',
        propertyName: 'outputs'
      },
      options
    );
  }
}
