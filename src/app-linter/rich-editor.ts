import {Editor} from './editor-interface';
import {RichEditor as IRichEditor} from './rich-editor-interface';

export class ErrorReportingEditor implements IRichEditor {

  private widgets: any[] = [];

  constructor(private delegate: Editor) {}

  getValue(): string {
    return this.delegate.getValue();
  }

  on(event: string, cb: Function) {
    this.delegate.on(event, cb);
  }

  operation(cb: Function): void {
    this.delegate.operation(cb);
  }

  removeLineWidget(widget: any) {
    this.delegate.removeLineWidget(widget);
  }

  addLineWidget(line: number, msg: HTMLElement, config: any) {
    this.delegate.addLineWidget(line, msg, config);
  }

  showErrors(errors: any[]) {
    const editor = this.delegate;
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
