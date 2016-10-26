export interface Editor {
  getValue(): string;
  on(event: string, cb: Function): void;
  operation(cb: Function): void;
  removeLineWidget(widget: any): void;
  addLineWidget(line: number, msg: HTMLElement, config: any): void;
}
