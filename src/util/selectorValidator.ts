export const SelectorValidator = {
  attribute(selector: string): boolean {
    return selector.length !== 0;
  },

  element(selector: string): boolean {
    return selector !== null;
  },

  kebabCase(selector: string): boolean {
    return /^[a-z0-9\-]+\-[a-z0-9\-]+$/.test(selector);
  },

  camelCase(selector: string): boolean {
    return /^[a-zA-Z0-9\[\]]+$/.test(selector);
  },

  prefix(prefix: string, selectorType: string): Function {
    const regex = new RegExp(`^\\[?(${prefix})`);

    return (selector: string) => {
      if (!prefix) {
        return true;
      }

      if (!regex.test(selector)) {
        return false;
      }

      const suffix = selector.replace(regex, '');

      if (selectorType === 'camelCase') {
        return !suffix || suffix[0] === suffix[0].toUpperCase();
      } else if (selectorType === 'kebab-case') {
        return !suffix || suffix[0] === '-';
      }

      throw Error('Invalid selector type');
    };
  }
};
