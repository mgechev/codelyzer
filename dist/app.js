"use strict";
var index_1 = require('./app-linter/index');
console.log("\nWelcome to        __     __\n  _________  ____/ /__  / /_  ______  ___  _____\n / ___/ __ \\/ __  / _ \\/ / / / /_  / / _ \\/ ___/\n/ /__/ /_/ / /_/ /  __/ / /_/ / / /_/  __/ /\n\\___/\\____/\\__,_/\\___/_/\\__, / /___/\\___/_/\n                       /____/\n");
console.log("Your code is being processed in a Web Worker.\nYou can see the errors in the web user interface\nas well as in the console of your browser.\n\n");
var sampleCode = localStorage.getItem('code') || "// Welcome to Codelyzer!\n//\n// Codelyzer is a tool great for teams and individuals, which helps you\n// write consistent code, and discover potential errors.\n//\n// It processes your TypeScript, templates, template expressions and\n// even inline styles! Most rules are inspired by the Angular style guide.\n// They have a URL associated with them that is going to link to the exact\n// section in angular.io/styleguide.\n//\n// Give it a try!\n\n@Component({\n  selector: 'hero-cmp',\n  template: `\n    <h1>Hello <span>{{ her.name }}</span></h1>\n  `,\n  styles: [\n    `\n    h1 spam {\n      color: red;\n    }\n    `\n  ]\n})\nclass Hero {\n  private hero: Hero;\n\n  ngOnInit() {\n    console.log('Initialized');\n  }\n}\n";
var editor = new index_1.ErrorReportingEditor('CodeMirror-lint-markers', window.CodeMirror(document.getElementById('editor'), {
    value: sampleCode,
    gutters: ['CodeMirror-lint-markers'],
    mode: 'javascript',
    theme: 'material',
    lineNumbers: true
}), new index_1.PlainReporter(new index_1.HtmlFormatter(), document.getElementById('warnings-header'), document.getElementById('warnings')));
var unlocked = true;
editor.on('change', function () {
    if (!unlocked) {
        return;
    }
    else {
        setTimeout(function () {
            localStorage.setItem('code', editor.getValue());
            unlocked = true;
        }, 1000);
        unlocked = false;
    }
});
new index_1.Linter({
    workerBundle: './dist/worker.bundle.js',
    textEditor: editor,
    onError: function (e) {
        if (checkbox.checked) {
            window.Raven.captureMessage(JSON.stringify({ error: e, code: editor.getValue() }));
        }
    }
}).init();
var dataCallback = function () {
    if (checkbox.checked) {
        return JSON.stringify({ code: editor.getValue() });
    }
    return undefined;
};
var checkbox = document.getElementById('reporting');
if (checkbox.checked) {
    window.Raven.config('https://7e471773c9324277a73eaef6eb874b0f@sentry.io/109396', {
        dataCallback: dataCallback
    }).install();
}
checkbox.onchange = function (e) {
    if (!checkbox.checked) {
        window.Raven.uninstall();
    }
    else {
        window.Raven.config('https://7e471773c9324277a73eaef6eb874b0f@sentry.io/109396', {
            dataCallback: dataCallback
        }).install();
    }
    console.log(checkbox.checked);
};
//# sourceMappingURL=app.js.map