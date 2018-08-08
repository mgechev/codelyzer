import { IRuleMetadata, Utils } from 'tslint/lib';
import { SelectorRule } from './selectorNameBase';

const OPTION_ATTRIBUTE = 'attribute';
const OPTION_ELEMENT = 'element';
const OPTION_CAMEL_CASE = 'camelCase';
const OPTION_KEBAB_CASE = 'kebab-case';

export class Rule extends SelectorRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Component selectors should follow given naming rules.',
    descriptionDetails: Utils.dedent`
      See more at https://angular.io/styleguide#style-02-07, https://angular.io/styleguide#style-05-02,
      and https://angular.io/styleguide#style-05-03.
    `,
    optionExamples: [
      [true, OPTION_ELEMENT, 'my-prefix', OPTION_KEBAB_CASE],
      [true, OPTION_ELEMENT, ['ng', 'ngx'], OPTION_KEBAB_CASE],
      [true, OPTION_ATTRIBUTE, 'myPrefix', OPTION_CAMEL_CASE],
      [true, [OPTION_ELEMENT, OPTION_ATTRIBUTE], 'myPrefix', OPTION_CAMEL_CASE]
    ],
    options: {
      items: [
        {
          enum: [OPTION_ATTRIBUTE, OPTION_ELEMENT]
        },
        {
          oneOf: [
            {
              items: {
                type: 'string'
              },
              type: 'array'
            },
            {
              type: 'string'
            }
          ]
        },
        {
          enum: [OPTION_CAMEL_CASE, OPTION_KEBAB_CASE]
        }
      ],
      maxLength: 3,
      minLength: 3,
      type: 'array'
    },
    optionsDescription: Utils.dedent`
      Options accept three obligatory items as an array:
      1. \`${OPTION_ELEMENT}\` or \`${OPTION_ATTRIBUTE}\` forces components to be used as either elements, attributes, or both (not recommended)
      2. A single prefix (string) or array of prefixes (strings) which have to be used in component selectors.
      3. \`${OPTION_KEBAB_CASE}\` or \`${OPTION_CAMEL_CASE}\` allows you to pick a case.
    `,
    rationale: Utils.dedent`
      * Consistent conventions make it easy to quickly identify and reference assets of different types.
      * Makes it easier to promote and share the component in other apps.
      * Components are easy to identify in the DOM.
      * Keeps the element names consistent with the specification for Custom Elements.
      * Components have templates containing HTML and optional Angular template syntax.
      * They display content. Developers place components on the page as they would native HTML elements and WebComponents.
      * It is easier to recognize that a symbol is a component by looking at the template's HTML.
    `,
    ruleName: 'component-selector',
    type: 'style',
    typescriptOnly: true
  };

  handleType = 'Component';

  getPrefixFailure(prefixes: string[]): string {
    if (prefixes.length === 1) {
      return 'The selector of the component "%s" should have prefix "%s" (https://angular.io/styleguide#style-02-07)';
    } else {
      return 'The selector of the component "%s" should have one of the prefixes "%s" (https://angular.io/styleguide#style-02-07)';
    }
  }

  getStyleFailure(): string {
    return 'The selector of the component "%s" should be named %s (https://angular.io/styleguide#style-05-02)';
  }

  getTypeFailure(): string {
    return 'The selector of the component "%s" should be used as %s (https://angular.io/styleguide#style-05-03)';
  }

  isEnabled(): boolean {
    const {
      metadata: {
        options: { maxLength, minLength }
      }
    } = Rule;
    const { length } = this.ruleArguments;

    return super.isEnabled() && length >= minLength && length <= maxLength;
  }
}
