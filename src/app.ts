import {Linter, Editor, HtmlFormatter} from './app-linter/index';

const sampleCode = `// Welcome to Codelyzer!
//
// Codelyzer is a tool great for teams and individuals, which helps you
// write consistent code, and helps you discover potential errors.
//
// In case you're working on a huge legacy codebase, codelyzer can
// automatically correct all the existing files for you!
//
// Codelyzer is extensible with custom rules and compatible with tslint!

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

new Linter({
  workerBundle: './dist/worker.bundle.js',
  textEditor: (window as any).CodeMirror(document.getElementById('editor'), {
    value: sampleCode,
    mode:  'javascript',
    theme: 'material',
    lineNumbers: true
  }) as Editor,
  errorLabelContainer: document.getElementById('warnings-header'),
  formatter: new HtmlFormatter(),
  errorsContainer: document.getElementById('warnings')
}).init();

