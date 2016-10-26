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
                _this.config.textEditor.showErrors(errors);
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
    return Linter;
}());
exports.Linter = Linter;
//# sourceMappingURL=linter.js.map