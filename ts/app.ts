var sampleCode = `// Welcome to Codelyzer!
//
// Codelyzer is a tool great for teams and individuals, which helps you
// write consistent code, and helps you discover potential errors.
//
// In case you're working on a huge legacy codebase, codelyzer can
// automatically correct all the existing files for you!
//
// Codelyzer is extensible with custom rules and compatible with tslint!

const bar = baz => {
  return 42;
}
`;
var myCodeMirror = (window as any).CodeMirror(document.getElementById('editor'), {
  value: sampleCode,
  mode:  'javascript',
  theme: 'material',
  lineNumbers: true
});

