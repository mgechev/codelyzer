export const escapeRegexp = (value: string) => value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
