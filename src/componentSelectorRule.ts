import { SelectorRule } from './selectorNameBase';
import * as Lint from 'tslint';

export class Rule extends SelectorRule {

  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'component-selector',
    type: 'style',
    description: `Component selectors should follow given naming rules.`,
    descriptionDetails: `See more at https://angular.io/styleguide#style-02-07, https://angular.io/styleguide#style-05-02, ` +
    `and https://angular.io/styleguide#style-05-03.`,
    rationale: Lint.Utils.dedent`
    * Consistent conventions make it easy to quickly identify and reference assets of different types.
    * Makes it easier to promote and share the component in other apps.
    * Components are easy to identify in the DOM.
    * Keeps the element names consistent with the specification for Custom Elements.
    * Components have templates containing HTML and optional Angular template syntax.
        * They display content. Developers place components on the page as they would native HTML elements and WebComponents.
    * It is easier to recognize that a symbol is a component by looking at the template's HTML.
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
    2. A single prefix (string) or array of prefixes (strings) which have to be used in component selectors.
    3. \`"kebab-case"\` or \`"camelCase"\` allows you to pick a case.
    `,
    typescriptOnly: true,
  };

  public handleType = 'Component';
  public getTypeFailure(): any {
    return 'The selector of the component "%s" should be used as %s (https://angular.io/styleguide#style-05-03)';
  }
  public getStyleFailure(): any {
    return 'The selector of the component "%s" should be named %s (https://angular.io/styleguide#style-05-02)';
  }
  getPrefixFailure(prefixes: string[]): any {
    if (prefixes.length === 1) {
      return 'The selector of the component "%s" should have prefix "%s" (https://angular.io/styleguide#style-02-07)';
    } else {
      return 'The selector of the component "%s" should have one of the prefixes "%s" (https://angular.io/styleguide#style-02-07)';
    }
  }
}
