import {Formatter} from './formatter-interface';
import {Editor} from './editor-interface';

export interface LinterConfig {
  formatter: Formatter;
  textEditor: Editor;
  errorsContainer: HTMLElement;
  errorLabelContainer: HTMLElement;
  workerBundle: string;
}

export class Linter {

  private worker: Worker;
  private widgets: any[] = [];

  constructor(private config: LinterConfig) {}

  init() {
    this.worker = new Worker(this.config.workerBundle);
    this.worker.addEventListener('message', (res: any) => {
      try {
        console.log(res.data);
        const errors = JSON.parse(res.data);
        this.renderErrors(errors);
        this.reportInlineErrors(errors);
      } catch (e) {
        console.error(e);
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
      this.config.errorLabelContainer.innerHTML = 'Good job! No warnings in your code!';
      this.config.errorsContainer.innerHTML = '';
    } else {
      this.config.errorLabelContainer.innerHTML = 'Warnings';
      this.config.errorsContainer.innerHTML = this.config.formatter.formatErrors(errors);
    }
  }

  reportInlineErrors(errors: any[]) {
    const editor = this.config.textEditor;
    editor.operation(() => {
      for (let i = 0; i < this.widgets.length; ++i)
        editor.removeLineWidget(this.widgets[i]);
      this.widgets.length = 0;

      for (let i = 0; i < errors.length; ++i) {
        const err = errors[i];
        if (!err) continue;
        const wrapper = document.createElement('div');
        const msg = document.createElement('div');
        const error = document.createElement('div');
        wrapper.className = 'lint-error';
        wrapper.appendChild(msg);
        wrapper.appendChild(error);
        error.className = 'error-tooltip';
        error.innerHTML = err.failure;
        msg.className = 'lint-icon';
        msg.onmouseenter = () => {
          error.classList.add('visible');
        };
        msg.onmouseleave = () => {
          error.classList.remove('visible');
        };
        this.widgets.push(editor.addLineWidget(err.startPosition.line - 1, wrapper, {coverGutter: false, noHScroll: true}));
      }
    });
  }
}
