export interface RichEditor {
  getValue(): string;
  on(event: string, cb: Function): void;
  operation(cb: Function): void;
  showErrors(errors: any[]): void;
}
