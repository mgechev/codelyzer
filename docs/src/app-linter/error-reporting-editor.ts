import { Editor } from './editor-interface';
import { RichEditor } from './rich-editor-interface';
import { Reporter } from './reporter-interface';

export class ErrorReportingEditor implements RichEditor, Editor {
  constructor(private marker: string, private delegate: Editor, private reporter: Reporter) {}

  getValue(): string {
    return this.delegate.getValue();
  }

  on(event: string, cb: Function) {
    this.delegate.on(event, cb);
  }

  operation(cb: Function): void {
    this.delegate.operation(cb);
  }

  clearGutter(id: string) {
    this.delegate.clearGutter(id);
  }

  setGutterMarker(line: number, id: string, msg: HTMLElement) {
    this.delegate.setGutterMarker(line, id, msg);
  }

  showErrors(errors: any[]) {
    const editor = this.delegate;
    this.renderErrors(errors);
    editor.operation(() => {
      editor.clearGutter(this.marker);

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
          this.reporter.highlight(err.id);
        };
        msg.onmouseleave = () => {
          error.classList.remove('visible');
          this.reporter.dropHighlight(err.id);
        };
        editor.setGutterMarker(err.startPosition.line, this.marker, wrapper);
      }
    });
  }

  private renderErrors(errors: any[]) {
    if (!errors || !errors.length) {
      this.reporter.setHeader('No warnings. Good job!');
      this.reporter.clearContent();
    } else {
      this.reporter.setHeader('Warnings');
      this.reporter.reportErrors(errors);
    }
  }
}
