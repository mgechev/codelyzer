import { IOptions, IRuleMetadata, Utils } from 'tslint/lib';
import { UsePropertyDecorator } from './propertyDecoratorBase';

export class Rule extends UsePropertyDecorator {
  static readonly metadata: IRuleMetadata = {
    description: 'Use @HostProperty decorator rather than the `host` property of `@Component` and `@Directive` metadata.',
    descriptionDetails: 'See more at https://angular.io/styleguide#style-06-03.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: Utils.dedent`
      The property associated with @HostBinding or the method associated with @HostListener
      can be modified only in a single place: in the directive's class. If you use the host metadata
      property, you must modify both the property declaration inside the controller, and the metadata
      associated with the directive.
    `,
    ruleName: 'use-host-property-decorator',
    type: 'style',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING =
    'Use @HostBindings and @HostListeners instead of the host property (https://angular.io/styleguide#style-06-03)';

  constructor(options: IOptions) {
    super(
      {
        decoratorName: ['HostBindings', 'HostListeners'],
        errorMessage: Rule.FAILURE_STRING,
        propertyName: 'host'
      },
      options
    );
  }
}
