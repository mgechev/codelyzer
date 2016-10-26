"use strict";
var ErrorReportingEditor = (function () {
    function ErrorReportingEditor(delegate) {
        this.delegate = delegate;
        this.widgets = [];
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
    ErrorReportingEditor.prototype.removeLineWidget = function (widget) {
        this.delegate.removeLineWidget(widget);
    };
    ErrorReportingEditor.prototype.addLineWidget = function (line, msg, config) {
        this.delegate.addLineWidget(line, msg, config);
    };
    ErrorReportingEditor.prototype.showErrors = function (errors) {
        var _this = this;
        var editor = this.delegate;
        editor.operation(function () {
            for (var i = 0; i < _this.widgets.length; ++i)
                editor.removeLineWidget(_this.widgets[i]);
            _this.widgets.length = 0;
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
                };
                msg.onmouseleave = function () {
                    error.classList.remove('visible');
                };
                _this.widgets.push(editor.addLineWidget(err.startPosition.line - 1, wrapper, { coverGutter: false, noHScroll: true }));
            };
            for (var i = 0; i < errors.length; ++i) {
                _loop_1(i);
            }
        });
    };
    return ErrorReportingEditor;
}());
exports.ErrorReportingEditor = ErrorReportingEditor;
//# sourceMappingURL=rich-editor.js.map