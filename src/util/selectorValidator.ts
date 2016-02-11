export const SelectorValidator = {
  attribute(selector: string): boolean {
    return /^\[.+\]$/.test(selector);
  },
  element(selector: string): boolean {
    return /^[^\[].+[^\]]$/.test(selector);
  },
  kebabCase(selector: string): boolean {
    return /^[a-z0-9\-\[\]]+$/.test(selector);
  },
  camelCase(selector: string): boolean {
    return /^[a-zA-Z0-9\[\]]+$/.test(selector);
  },
  prefix(prefix: string): Function {
    return (selector: string) => {
      return new RegExp(`^\\[?${prefix}`).test(selector);
    };
  }
};
