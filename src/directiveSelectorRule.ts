import {SelectorRule} from './selectorNameBase';
import * as Lint from 'tslint';

export class Rule extends SelectorRule {

  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'directive-selector',
    type: 'style',
    description: `Directive selectors should follow given naming rules.`,
    descriptionDetails: `See more at https://angular.io/styleguide#!#02-07, https://angular.io/styleguide#!#05-02, ` +
    `and https://angular.io/styleguide#!#05-03.`,
    rationale: Lint.Utils.dedent`
    * Consistent conventions make it easy to quickly identify and reference assets of different types.
    * Makes it easier to promote and share the directive in other apps.
    * Directives are easy to identify in the DOM.
    * It is easier to recognize that a symbol is a directive by looking at the template's HTML.
    `,
    options: {
      'type': 'array',
      'items': [
        {
          'enum': ['element', 'attribute']
        },
        {
          'oneOf': [
            {
              'type': 'array',
              'items': {
                'type': 'string'
              }
            },
            {
              'type': 'string'
            }
          ]
        },
        {
          'enum': ['kebab-case', 'camelCase']
        }
      ],
      'minItems': 3,
      'maxItems': 3
    },
    optionExamples: [
      `["element", "my-prefix", "kebab-case"]`,
      `["element", ["ng", "ngx"], "kebab-case"]`,
      `["attribute", "myPrefix", "camelCase"]`,
    ],
    optionsDescription: Lint.Utils.dedent`
    Options accept three obligatory items as an array:

    1. \`"element"\` or \`"attribute"\` forces components either to be elements or attributes.
    2. A single prefix (string) or array of prefixes (strings) which have to be used in directive selectors.
    3. \`"kebab-case"\` or \`"camelCase"\` allows you to pick a case.
    `,
    typescriptOnly: true,
  };

  public handleType = 'Directive';
  public getTypeFailure():any { return 'The selector of the directive "%s" should be used as %s ($$02-06$$)'; }
  public getNameFailure():any { return 'The selector of the directive "%s" should be named %s ($$02-06$$)'; }
  getSinglePrefixFailure():any { return 'The selector of the directive "%s" should have prefix "%s" ($$02-08$$)'; }
  getManyPrefixFailure():any { return 'The selector of the directive "%s" should have one of the prefixes: %s ($$02-08$$)'; }

}

