export interface Editor {
  getValue(): string;
  on(event: string, cb: Function): void;
  operation(cb: Function): void;
  clearGutter(id: any): void;
  setGutterMarker(line: number, id: string, msg: HTMLElement): void;
}
