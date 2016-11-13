export const SelectorValidator = {
  attribute(selector: string): boolean {
    return selector.length!==0;
  },

  element(selector: string): boolean {
    return selector!==null;
  },

  kebabCase(selector: string): boolean {
    return /^[a-z0-9\-]+\-[a-z0-9\-]+$/.test(selector);
  },

  camelCase(selector: string): boolean {
    return /^[a-zA-Z0-9\[\]]+$/.test(selector);
  },

  prefix(prefix: string): Function {
    return (selector: string) => {
      return new RegExp(`^\\[?${prefix}`).test(selector);
    };
  },

  multiPrefix(prefixes: string): Function {
    return (selector: string) => {
        return new RegExp(`^\\[?(${prefixes})`).test(selector);
    };
  }
};
