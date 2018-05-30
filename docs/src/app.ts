import { Linter, Editor, HtmlFormatter, ErrorReportingEditor, PlainReporter } from './app-linter/index';

console.log(`
Welcome to        __     __
  _________  ____/ /__  / /_  ______  ___  _____
 / ___/ __ \\/ __  / _ \\/ / / / /_  / / _ \\/ ___/
/ /__/ /_/ / /_/ /  __/ / /_/ / / /_/  __/ /
\\___/\\____/\\__,_/\\___/_/\\__, / /___/\\___/_/
                       /____/\n`);

console.log(`Your code is being processed in a Web Worker.
You can see the errors in the web user interface
as well as in the console of your browser.\n\n`);

const sampleCode =
  localStorage.getItem('code') ||
  `// Welcome to Codelyzer!
//
// Codelyzer is a tool great for teams and individuals, which helps you
// write consistent code, and discover potential errors.
//
// It processes your TypeScript, templates, template expressions and
// even inline styles! Most rules are inspired by the Angular style guide.
// They have a URL associated with them that is going to link to the exact
// section in angular.io/styleguide.
//
// Give it a try!

@Component({
  selector: 'hero-cmp',
  template: \`
    <h1>Hello <span>{{ her.name }}</span></h1>
  \`,
  styles: [
    \`
    h1 spam {
      color: red;
    }
    \`
  ]
})
class Hero {
  private hero: Hero;

  ngOnInit() {
    console.log('Initialized');
  }
}
`;

const editor = new ErrorReportingEditor(
  'CodeMirror-lint-markers',
  (window as any).CodeMirror(document.getElementById('editor'), {
    value: sampleCode,
    gutters: ['CodeMirror-lint-markers'],
    mode: 'javascript',
    theme: 'material',
    lineNumbers: true
  }) as Editor,
  new PlainReporter(new HtmlFormatter(), document.getElementById('warnings-header')!, document.getElementById('warnings')!)
);

let unlocked = true;
editor.on('change', () => {
  if (!unlocked) {
    return;
  } else {
    setTimeout(() => {
      localStorage.setItem('code', editor.getValue());
      unlocked = true;
    }, 1000);
    unlocked = false;
  }
});

// Start the linter
new Linter({
  workerBundle: './dist/worker.bundle.js',
  textEditor: editor,
  onError(e: any) {
    if (checkbox.checked) {
      (window as any).Raven.captureMessage(JSON.stringify({ error: e, code: editor.getValue() }));
    }
  }
}).init();

const dataCallback = () => {
  if (checkbox.checked) {
    return JSON.stringify({ code: editor.getValue() });
  }
  return undefined;
};

// Sentry config
const checkbox = document.getElementById('reporting') as HTMLInputElement;
if (checkbox.checked) {
  (window as any).Raven.config('https://7e471773c9324277a73eaef6eb874b0f@sentry.io/109396', {
    dataCallback
  }).install();
}
checkbox.onchange = (e: any) => {
  if (!checkbox.checked) {
    (window as any).Raven.uninstall();
  } else {
    (window as any).Raven.config('https://7e471773c9324277a73eaef6eb874b0f@sentry.io/109396', {
      dataCallback
    }).install();
  }
  console.log(checkbox.checked);
};
