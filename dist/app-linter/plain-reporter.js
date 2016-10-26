"use strict";
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
    return PlainReporter;
}());
exports.PlainReporter = PlainReporter;
//# sourceMappingURL=plain-reporter.js.map