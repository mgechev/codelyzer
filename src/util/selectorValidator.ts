import { OPTION_STYLE_CAMEL_CASE, OPTION_STYLE_KEBAB_CASE, SelectorStyle } from '../selectorPropertyBase';

export const SelectorValidator = {
  attribute(selector: string): boolean {
    return selector.length !== 0;
  },

  camelCase(selector: string): boolean {
    return /^[a-zA-Z0-9\[\]]+$/.test(selector);
  },

  element(selector: string): boolean {
    return selector !== null;
  },

  kebabCase(selector: string): boolean {
    return /^[a-z0-9\-]+\-[a-z0-9\-]+$/.test(selector);
  },

  prefix(prefix: string, selectorStyle: SelectorStyle): (selector: string) => boolean {
    const regex = new RegExp(`^\\[?(${prefix})`);

    return (selector) => {
      if (!prefix) return true;

      if (!regex.test(selector)) return false;

      const suffix = selector.replace(regex, '');

      if (selectorStyle === OPTION_STYLE_CAMEL_CASE) {
        return !suffix || suffix[0] === suffix[0].toUpperCase();
      } else if (selectorStyle === OPTION_STYLE_KEBAB_CASE) {
        return !suffix || suffix[0] === '-';
      }

      throw Error('Invalid selector style!');
    };
  },
};
