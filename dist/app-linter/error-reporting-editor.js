"use strict";
var ErrorReportingEditor = (function () {
    function ErrorReportingEditor(marker, delegate, reporter) {
        this.marker = marker;
        this.delegate = delegate;
        this.reporter = reporter;
    }
    ErrorReportingEditor.prototype.getValue = function () {
        return this.delegate.getValue();
    };
    ErrorReportingEditor.prototype.on = function (event, cb) {
        this.delegate.on(event, cb);
    };
    ErrorReportingEditor.prototype.operation = function (cb) {
        this.delegate.operation(cb);
    };
    ErrorReportingEditor.prototype.clearGutter = function (id) {
        this.delegate.clearGutter(id);
    };
    ErrorReportingEditor.prototype.setGutterMarker = function (line, id, msg) {
        this.delegate.setGutterMarker(line, id, msg);
    };
    ErrorReportingEditor.prototype.showErrors = function (errors) {
        var _this = this;
        var editor = this.delegate;
        this.renderErrors(errors);
        editor.operation(function () {
            editor.clearGutter(_this.marker);
            var _loop_1 = function(i) {
                var err = errors[i];
                if (!err)
                    return "continue";
                var wrapper = document.createElement('div');
                var msg = document.createElement('div');
                var error = document.createElement('div');
                wrapper.className = 'lint-error';
                wrapper.appendChild(msg);
                wrapper.appendChild(error);
                error.className = 'error-tooltip';
                error.innerHTML = err.failure;
                msg.className = 'lint-icon';
                msg.onmouseenter = function () {
                    error.classList.add('visible');
                    _this.reporter.highlight(err.id);
                };
                msg.onmouseleave = function () {
                    error.classList.remove('visible');
                    _this.reporter.dropHighlight(err.id);
                };
                editor.setGutterMarker(err.startPosition.line, _this.marker, wrapper);
            };
            for (var i = 0; i < errors.length; ++i) {
                _loop_1(i);
            }
        });
    };
    ErrorReportingEditor.prototype.renderErrors = function (errors) {
        if (!errors || !errors.length) {
            this.reporter.setHeader('Good job! No warnings in your code!');
            this.reporter.clearContent();
        }
        else {
            this.reporter.setHeader('Warnings');
            this.reporter.reportErrors(errors);
        }
    };
    return ErrorReportingEditor;
}());
exports.ErrorReportingEditor = ErrorReportingEditor;
//# sourceMappingURL=error-reporting-editor.js.map