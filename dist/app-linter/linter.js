"use strict";
var Linter = (function () {
    function Linter(config) {
        this.config = config;
        this.widgets = [];
    }
    Linter.prototype.init = function () {
        var _this = this;
        this.worker = new Worker(this.config.workerBundle);
        this.worker.addEventListener('message', function (res) {
            try {
                console.log(res.data);
                var errors = JSON.parse(res.data);
                _this.renderErrors(errors);
                _this.reportInlineErrors(errors);
            }
            catch (e) {
                console.error(e);
            }
        });
        this.config.textEditor.on('change', function () {
            return _this.lint(_this.config.textEditor.getValue());
        });
        this.lint(this.config.textEditor.getValue());
    };
    Linter.prototype.lint = function (program) {
        this.worker.postMessage(JSON.stringify({ program: program }));
    };
    Linter.prototype.renderErrors = function (errors) {
        if (!errors || !errors.length) {
            this.config.errorLabelContainer.innerHTML = 'Good job! No warnings in your code!';
            this.config.errorsContainer.innerHTML = '';
        }
        else {
            this.config.errorLabelContainer.innerHTML = 'Warnings';
            this.config.errorsContainer.innerHTML = this.config.formatter.formatErrors(errors);
        }
    };
    Linter.prototype.reportInlineErrors = function (errors) {
        var _this = this;
        var editor = this.config.textEditor;
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
    return Linter;
}());
exports.Linter = Linter;
//# sourceMappingURL=linter.js.map