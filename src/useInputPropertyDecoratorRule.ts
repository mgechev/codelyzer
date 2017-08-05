import * as Lint from 'tslint';

import { UsePropertyDecorator } from './propertyDecoratorBase';
import { IOptions } from 'tslint';

export class Rule extends UsePropertyDecorator {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'use-input-property-decorator',
    type: 'style',
    description: `Use \`@Input\` decorator rather than the \`inputs\` property of \`@Component\` and \`@Directive\` metadata.`,
    descriptionDetails: `See more at https://angular.io/styleguide#style-05-12.`,
    rationale: Lint.Utils.dedent`
    * It is easier and more readable to identify which properties in a class are inputs.
    * If you ever need to rename the property name associated with \`@Input\`, you can modify it in a single place.
    * The metadata declaration attached to the directive is shorter and thus more readable.
    * Placing the decorator on the same line usually makes for shorter code and still easily identifies the property as an input.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };


  constructor(options: IOptions) {
    super({
      decoratorName: 'Input',
      propertyName: 'inputs',
      errorMessage: 'Use the @Input property decorator instead of the inputs property (https://angular.io/styleguide#style-05-12)'
    }, options);
  }
}

