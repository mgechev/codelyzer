import * as Lint from 'tslint';
import { UsePropertyDecorator } from './propertyDecoratorBase';

export class Rule extends UsePropertyDecorator {
  static metadata: Lint.IRuleMetadata = {
    description:
      'Use @ContentChild, @ContentChildren, @ViewChild or @ViewChildren instead of the `queries` property of ' +
      '`@Component` or `@Directive` metadata.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale:
      'The property associated with `@ContentChild`, `@ContentChildren`, `@ViewChild` or `@ViewChildren` ' +
      `can be modified only in a single place: in the directive's class. If you use the \`queries\` metadata ` +
      'property, you must modify both the property declaration inside the controller, and the metadata ' +
      'associated with the directive.',
    ruleName: 'no-queries-parameter',
    type: 'style',
    typescriptOnly: true
  };

  static FAILURE_STRING = 'Use @ContentChild, @ContentChildren, @ViewChild or @ViewChildren instead of the queries property';

  constructor(options: Lint.IOptions) {
    super(
      {
        decoratorName: ['ContentChild', 'ContentChildren', 'ViewChild', 'ViewChildren'],
        propertyName: 'queries',
        errorMessage: Rule.FAILURE_STRING
      },
      options
    );
  }
}
