export interface Reporter {
  setHeader(header: string): void;
  reportErrors(errors: any[]): void;
  clearHeader(): void;
  clearContent(): void;
}
