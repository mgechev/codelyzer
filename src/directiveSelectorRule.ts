import { IRuleMetadata } from 'tslint/lib';
import { arrayify, dedent } from 'tslint/lib/utils';
import {
  OPTION_STYLE_CAMEL_CASE,
  OPTION_STYLE_KEBAB_CASE,
  OPTION_TYPE_ATTRIBUTE,
  OPTION_TYPE_ELEMENT,
  SelectorPropertyBase,
  SelectorStyle,
  SelectorType,
} from './selectorPropertyBase';
import { isNotNullOrUndefined } from './util/isNotNullOrUndefined';

const STYLE_GUIDE_PREFIX_LINK = 'https://angular.io/guide/styleguide#style-02-08';
const STYLE_GUIDE_STYLE_TYPE_LINK = 'https://angular.io/guide/styleguide#style-02-06';

export class Rule extends SelectorPropertyBase {
  static readonly metadata: IRuleMetadata = {
    description: 'Directive selectors should follow given naming rules.',
    descriptionDetails: `See more at ${STYLE_GUIDE_STYLE_TYPE_LINK} and ${STYLE_GUIDE_PREFIX_LINK}`,
    optionExamples: [
      [true, OPTION_TYPE_ELEMENT, 'my-prefix', OPTION_STYLE_KEBAB_CASE],
      [true, OPTION_TYPE_ELEMENT, ['ng', 'ngx'], OPTION_STYLE_KEBAB_CASE],
      [true, OPTION_TYPE_ATTRIBUTE, 'myPrefix', OPTION_STYLE_CAMEL_CASE],
      [true, [OPTION_TYPE_ELEMENT, OPTION_TYPE_ATTRIBUTE], 'myPrefix', OPTION_STYLE_CAMEL_CASE],
    ],
    options: {
      items: [
        {
          enum: [OPTION_TYPE_ATTRIBUTE, OPTION_TYPE_ELEMENT],
        },
        {
          oneOf: [
            {
              items: {
                type: 'string',
              },
              type: 'array',
            },
            {
              type: 'string',
            },
          ],
        },
        {
          enum: [OPTION_STYLE_CAMEL_CASE, OPTION_STYLE_KEBAB_CASE],
        },
      ],
      maxLength: 3,
      minLength: 3,
      type: 'array',
    },
    optionsDescription: dedent`
      Options accept three obligatory items as an array:
      1. \`${OPTION_TYPE_ELEMENT}\` or \`${OPTION_TYPE_ATTRIBUTE}\` forces directives to be used as either elements, attributes, or both (not recommended)
      2. A single prefix (string) or array of prefixes (strings) which have to be used in directive selectors.
      3. \`${OPTION_STYLE_KEBAB_CASE}\` or \`${OPTION_STYLE_CAMEL_CASE}\` allows you to pick a case.
    `,
    rationale: dedent`
      * Consistent conventions make it easy to quickly identify and reference assets of different types.
      * Makes it easier to promote and share the directive in other apps.
      * Directives are easy to identify in the DOM.
      * Keeps the element names consistent with the specification for Custom Elements.
      * It is easier to recognize that a symbol is a directive by looking at the template's HTML.
    `,
    ruleName: 'directive-selector',
    type: 'style',
    typescriptOnly: true,
  };

  handleType = 'Directive';

  getPrefixFailure(prefixes: ReadonlyArray<string>): string {
    const prefixStr = prefixes.length === 1 ? '' : ' one of the prefixes:';

    return `The selector should be prefixed by${prefixStr} "${prefixes.join(', ')}" (${STYLE_GUIDE_PREFIX_LINK})`;
  }

  getStyleFailure(style: SelectorStyle): string {
    const styleStr = style === OPTION_STYLE_KEBAB_CASE ? `${OPTION_STYLE_KEBAB_CASE}d and include a dash` : `${OPTION_STYLE_CAMEL_CASE}d`;

    return `The selector should be ${styleStr} (${STYLE_GUIDE_STYLE_TYPE_LINK})`;
  }

  getTypeFailure(types: ReadonlyArray<SelectorType>): string {
    return `The selector should be used as an ${types.join(' or ')} (${STYLE_GUIDE_STYLE_TYPE_LINK})`;
  }

  isEnabled(): boolean {
    const {
      metadata: {
        options: {
          items: {
            [0]: { enum: enumTypes },
            [2]: { enum: enumStyles },
          },
          maxLength,
          minLength,
        },
      },
    } = Rule;
    const { length: argumentsLength } = this.ruleArguments;
    const typeArgument = arrayify<SelectorType>(this.ruleArguments[0]);
    const prefixArgument = arrayify<string>(this.ruleArguments[1]).filter(isNotNullOrUndefined);
    const styleArgument = this.ruleArguments[2] as SelectorStyle;
    const argumentsLengthInRange = argumentsLength >= minLength && argumentsLength <= maxLength;
    const isTypeArgumentValid = typeArgument.length > 0 && typeArgument.every((argument) => enumTypes.indexOf(argument) !== -1);
    const isPrefixArgumentValid = prefixArgument.length > 0;
    const isStyleArgumentValid = enumStyles.indexOf(styleArgument) !== -1;

    return super.isEnabled() && argumentsLengthInRange && isTypeArgumentValid && isPrefixArgumentValid && isStyleArgumentValid;
  }
}
