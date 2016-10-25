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
    <h1>Hello <span>{{ hero.name }}</span></h1>
  \`,
  styles: [
    \`
    h1 spam {
      color: red;
    }
    \`
  ]
})
class HeroComponent {
  private hero: Hero;
}
`;

const myCodeMirror = (window as any).CodeMirror(document.getElementById('editor'), {
  value: sampleCode,
  mode:  'javascript',
  theme: 'material',
  lineNumbers: true
});

myCodeMirror.on('change', (e: any) => {
  worker.postMessage(JSON.stringify({
    file: myCodeMirror.getValue()
  }));
});

const worker = new Worker('./dist/worker.min.js');
worker.addEventListener('message', (res: any) => {
  try {
    const data = JSON.parse(res.data);
    console.log(data);
  } catch (e) {
    console.error(e);
  }
});

