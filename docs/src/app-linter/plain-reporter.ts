import { Formatter } from './formatter-interface';
import { Reporter } from './reporter-interface';

export class PlainReporter implements Reporter {
  constructor(private formatter: Formatter, private header: HTMLElement, private content: HTMLElement) {}

  setHeader(header: string) {
    this.header.innerHTML = header;
  }

  reportErrors(errors: any[]) {
    this.content.innerHTML = this.formatter.formatErrors(errors);
  }

  clearHeader() {
    this.header.innerHTML = '';
  }

  clearContent() {
    this.content.innerHTML = '';
  }

  highlight(id: any) {
    document.getElementById(id)!.classList.add('error-highlight');
  }

  dropHighlight(id: any) {
    document.getElementById(id)!.classList.remove('error-highlight');
  }
}
