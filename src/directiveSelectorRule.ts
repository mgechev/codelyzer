import { IRuleMetadata, Utils } from 'tslint/lib';
import { SelectorRule } from './selectorNameBase';

const OPTION_ATTRIBUTE = 'attribute';
const OPTION_ELEMENT = 'element';
const OPTION_CAMEL_CASE = 'camelCase';
const OPTION_KEBAB_CASE = 'kebab-case';

export class Rule extends SelectorRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Directive selectors should follow given naming rules.',
    descriptionDetails: 'See more at https://angular.io/styleguide#style-02-06 and https://angular.io/styleguide#style-02-08.',
    optionExamples: [
      [true, OPTION_ELEMENT, 'my-prefix', OPTION_KEBAB_CASE],
      [true, OPTION_ELEMENT, ['ng', 'ngx'], OPTION_KEBAB_CASE],
      [true, OPTION_ATTRIBUTE, 'myPrefix', OPTION_CAMEL_CASE]
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
      1. \`${OPTION_ELEMENT}\` or \`${OPTION_ATTRIBUTE}\` forces directives either to be elements or attributes.
      2. A single prefix (string) or array of prefixes (strings) which have to be used in directive selectors.
      3. \`${OPTION_KEBAB_CASE}\` or \`${OPTION_CAMEL_CASE}\` allows you to pick a case.
    `,
    rationale: Utils.dedent`
      * Consistent conventions make it easy to quickly identify and reference assets of different types.
      * Makes it easier to promote and share the directive in other apps.
      * Directives are easy to identify in the DOM.
      * It is easier to recognize that a symbol is a directive by looking at the template's HTML.
    `,
    ruleName: 'directive-selector',
    type: 'style',
    typescriptOnly: true
  };

  handleType = 'Directive';

  getPrefixFailure(prefixes: string[]): string {
    if (prefixes.length === 1) {
      return 'The selector of the directive "%s" should have prefix "%s" (https://angular.io/styleguide#style-02-08)';
    } else {
      return 'The selector of the directive "%s" should have one of the prefixes "%s" (https://angular.io/styleguide#style-02-08)';
    }
  }

  getStyleFailure(): string {
    return 'The selector of the directive "%s" should be named %s (https://angular.io/styleguide#style-02-06)';
  }

  getTypeFailure(): string {
    return 'The selector of the directive "%s" should be used as %s (https://angular.io/styleguide#style-02-06)';
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
