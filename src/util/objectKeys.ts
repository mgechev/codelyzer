export const objectKeys = Object.keys as <T>(o: T) => ReadonlyArray<Extract<keyof T, string>>;
