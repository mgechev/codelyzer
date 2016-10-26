"use strict";
var ErrorReportingEditor = (function () {
    function ErrorReportingEditor(marker, delegate) {
        this.marker = marker;
        this.delegate = delegate;
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
                    return error.classList.add('visible');
                };
                msg.onmouseleave = function () {
                    return error.classList.remove('visible');
                };
                editor.setGutterMarker(err.startPosition.line, _this.marker, wrapper);
            };
            for (var i = 0; i < errors.length; ++i) {
                _loop_1(i);
            }
        });
    };
    return ErrorReportingEditor;
}());
exports.ErrorReportingEditor = ErrorReportingEditor;
//# sourceMappingURL=error-reporting-editor.js.map