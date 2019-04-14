export const escapeRegexp = (value: string): string => value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
