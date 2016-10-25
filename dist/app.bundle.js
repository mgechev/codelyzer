(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1]);
