export const SelectorValidator = {
  directive(selector: string): boolean {
    return /^\[[a-zA-Z0-9]+\]$/.test(selector);
  },
  component(selector: string): boolean {
    return /^[a-z0-9\-]+$/.test(selector);
  }
};
