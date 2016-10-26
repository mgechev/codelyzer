export interface Reporter {
  setHeader(header: string): void;
  reportErrors(errors: any[]): void;
  clearHeader(): void;
  clearContent(): void;
  highlight(id: any): void;
  dropHighlight(id: any): void;
}
