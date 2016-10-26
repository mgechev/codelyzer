import {Formatter} from './formatter-interface';
import {RichEditor} from './rich-editor-interface';
import {Reporter} from './reporter-interface';

export interface LinterConfig {
  reporter: Reporter;
  textEditor: RichEditor;
  workerBundle: string;
  onError: Function;
}

export class Linter {

  private worker: Worker;
  private widgets: any[] = [];

  constructor(private config: LinterConfig) {}

  init() {
    this.worker = new Worker(this.config.workerBundle);
    this.worker.addEventListener('message', (res: any) => {
      try {
        if (res.data.output) {
          const output = JSON.parse(res.data.output);
          console.log(res.data.output);
          this.renderErrors(output);
          this.config.textEditor.showErrors(output);
        } else {
          this.config.onError(res.data.error);
        }
      } catch (e) {
        this.config.onError(e);
      }
    });
    this.config.textEditor.on('change', () =>
      this.lint(this.config.textEditor.getValue()));
    this.lint(this.config.textEditor.getValue());
  }

  lint(program: string) {
    this.worker.postMessage(JSON.stringify({ program }));
  }

  renderErrors(errors: any[]) {
    if (!errors || !errors.length) {
      this.config.reporter.setHeader('Good job! No warnings in your code!')
      this.config.reporter.clearContent();
    } else {
      this.config.reporter.setHeader('Warnings')
      this.config.reporter.reportErrors(errors);
    }
  }
}
