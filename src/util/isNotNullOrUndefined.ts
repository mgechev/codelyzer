// Needed because in the current Typescript version (TS 3.3.3333), Boolean() cannot be used to perform a null check.
// For more, see: https://github.com/Microsoft/TypeScript/issues/16655
export const isNotNullOrUndefined = <T>(input: null | undefined | T): input is T => input !== null && input !== undefined;
