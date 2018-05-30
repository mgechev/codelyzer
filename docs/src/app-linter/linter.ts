import { RichEditor } from './rich-editor-interface';

export interface LinterConfig {
  textEditor: RichEditor;
  workerBundle: string;
  onError: Function;
}

export class Linter {
  private worker!: Worker;
  private errorId = 0;

  constructor(private config: LinterConfig) {}

  init() {
    this.worker = new Worker(this.config.workerBundle);
    this.worker.addEventListener('message', (res: any) => {
      try {
        if (res.data.output) {
          const output = JSON.parse(res.data.output);
          console.log(res.data.output);
          output.forEach((e: any) => (e.id = `cdlz-${++this.errorId}`));
          this.config.textEditor.showErrors(output);
          if (this.errorId > 1e10) {
            this.errorId = 0;
          }
        } else {
          this.config.onError(res.data.error);
        }
      } catch (e) {
        this.config.onError(e);
      }
    });
    this.config.textEditor.on('change', () => this.lint(this.config.textEditor.getValue()));
    this.lint(this.config.textEditor.getValue());
  }

  lint(program: string) {
    this.worker.postMessage(JSON.stringify({ program }));
  }
}
