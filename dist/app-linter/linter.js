"use strict";
var Linter = (function () {
    function Linter(config) {
        this.config = config;
        this.widgets = [];
        this.errorId = 0;
    }
    Linter.prototype.init = function () {
        var _this = this;
        this.worker = new Worker(this.config.workerBundle);
        this.worker.addEventListener('message', function (res) {
            try {
                if (res.data.output) {
                    var output = JSON.parse(res.data.output);
                    console.log(res.data.output);
                    output.forEach(function (e) { return e.id = ++_this.errorId; });
                    _this.config.textEditor.showErrors(output);
                    if (_this.errorId > 1e10) {
                        _this.errorId = 0;
                    }
                }
                else {
                    _this.config.onError(res.data.error);
                }
            }
            catch (e) {
                _this.config.onError(e);
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
    return Linter;
}());
exports.Linter = Linter;
//# sourceMappingURL=linter.js.map