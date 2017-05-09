"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PlainReporter = (function () {
    function PlainReporter(formatter, header, content) {
        this.formatter = formatter;
        this.header = header;
        this.content = content;
    }
    PlainReporter.prototype.setHeader = function (header) {
        this.header.innerHTML = header;
    };
    PlainReporter.prototype.reportErrors = function (errors) {
        this.content.innerHTML = this.formatter.formatErrors(errors);
    };
    PlainReporter.prototype.clearHeader = function () {
        this.header.innerHTML = '';
    };
    PlainReporter.prototype.clearContent = function () {
        this.content.innerHTML = '';
    };
    PlainReporter.prototype.highlight = function (id) {
        document.getElementById(id).classList.add('error-highlight');
    };
    PlainReporter.prototype.dropHighlight = function (id) {
        document.getElementById(id).classList.remove('error-highlight');
    };
    return PlainReporter;
}());
exports.PlainReporter = PlainReporter;
//# sourceMappingURL=plain-reporter.js.map