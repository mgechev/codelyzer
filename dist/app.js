"use strict";
var index_1 = require('./app-linter/index');
var sampleCode = "// Welcome to Codelyzer!\n//\n// Codelyzer is a tool great for teams and individuals, which helps you\n// write consistent code, and helps you discover potential errors.\n//\n// In case you're working on a huge legacy codebase, codelyzer can\n// automatically correct all the existing files for you!\n//\n// Codelyzer is extensible with custom rules and compatible with tslint!\n\n@Component({\n  selector: 'hero-cmp',\n  template: `\n    <h1>Hello <span>{{ hero.name }}</span></h1>\n  `,\n  styles: [\n    `\n    h1 spam {\n      color: red;\n    }\n    `\n  ]\n})\nclass HeroComponent {\n  private hero: Hero;\n}\n";
new index_1.Linter({
    workerBundle: './dist/worker.bundle.js',
    textEditor: window.CodeMirror(document.getElementById('editor'), {
        value: sampleCode,
        mode: 'javascript',
        theme: 'material',
        lineNumbers: true
    }),
    errorLabelContainer: document.getElementById('warnings-header'),
    formatter: new index_1.HtmlFormatter(),
    errorsContainer: document.getElementById('warnings')
}).init();
//# sourceMappingURL=app.js.map