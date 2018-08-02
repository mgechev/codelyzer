import { IOptions, IRuleMetadata, Utils } from 'tslint/lib';
import { UsePropertyDecorator } from './propertyDecoratorBase';

export class Rule extends UsePropertyDecorator {
  static readonly metadata: IRuleMetadata = {
    description:
      'Use @ContentChild, @ContentChildren, @ViewChild or @ViewChildren instead of the `queries` property of `@Component` or `@Directive` metadata.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: Utils.dedent`
      The property associated with @ContentChild, @ContentChildren, @ViewChild or @ViewChildren
      can be modified only in a single place: in the directive's class. If you use the queries metadata
      property, you must modify both the property declaration inside the controller, and the metadata
      associated with the directive.
    `,
    ruleName: 'no-queries-parameter',
    type: 'style',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Use @ContentChild, @ContentChildren, @ViewChild or @ViewChildren instead of the queries property';

  constructor(options: IOptions) {
    super(
      {
        decoratorName: ['ContentChild', 'ContentChildren', 'ViewChild', 'ViewChildren'],
        errorMessage: Rule.FAILURE_STRING,
        propertyName: 'queries'
      },
      options
    );
  }
}
