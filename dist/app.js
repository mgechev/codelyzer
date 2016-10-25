var sampleCode = "// Welcome to Codelyzer!\n//\n// Codelyzer is a tool great for teams and individuals, which helps you\n// write consistent code, and helps you discover potential errors.\n//\n// In case you're working on a huge legacy codebase, codelyzer can\n// automatically correct all the existing files for you!\n//\n// Codelyzer is extensible with custom rules and compatible with tslint!\n\n@Component({\n  selector: 'hero-cmp',\n  template: `\n    <h1>Hello <span>{{ hero.name }}</span></h1>\n  `\n  styles: [\n    `\n    h1 spam {\n      color: red;\n    }\n    `\n  ]\n})\nclass HeroComponent {\n  private hero: Hero;\n}\n";
var myCodeMirror = window.CodeMirror(document.getElementById('editor'), {
    value: sampleCode,
    mode: 'javascript',
    theme: 'material',
    lineNumbers: true
});
myCodeMirror.on('change', function (e) {
    worker.postMessage(JSON.stringify({
        file: myCodeMirror.getValue()
    }));
});
var worker = new Worker('./dist/worker.min.js');
worker.addEventListener('message', function (res) {
    try {
        var data = JSON.parse(res.data);
        console.log(data);
    }
    catch (e) {
        console.error(e);
    }
});
//# sourceMappingURL=app.js.map