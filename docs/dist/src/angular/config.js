"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = {
    None: 0,
    Error: 1,
    Info: 3,
    Debug: 7
};
var BUILD_TYPE = '<%= BUILD_TYPE %>';
exports.Config = {
    interpolation: ['{{', '}}'],
    resolveUrl: function (url, d) {
        return url;
    },
    transformTemplate: function (code, url, d) {
        if (!url || url.endsWith('.html')) {
            return { code: code, url: url };
        }
        return { code: '', url: url };
    },
    transformStyle: function (code, url, d) {
        if (!url || url.endsWith('.css')) {
            return { code: code, url: url };
        }
        return { code: '', url: url };
    },
    predefinedDirectives: [
        { selector: 'form', exportAs: 'ngForm' },
        { selector: '[routerLinkActive]', exportAs: 'routerLinkActive' },
        { selector: '[ngModel]:not([formControlName]):not([formControl])', exportAs: 'ngModel' },
        { selector: '[md-menu-item], [mat-menu-item]', exportAs: 'mdMenuItem' },
        { selector: 'md-menu, mat-menu', exportAs: 'mdMenu' },
        { selector: 'md-button-toggle-group:not([multiple])', exportAs: 'mdButtonToggleGroup' },
        { selector: '[md-menu-trigger-for], [mat-menu-trigger-for], [mdMenuTriggerFor]', exportAs: 'mdMenuTrigger' },
        { selector: '[md-tooltip], [mat-tooltip], [mdTooltip]', exportAs: 'mdTooltip' },
        { selector: 'md-select, mat-select', exportAs: 'mdSelect' },
        { selector: '[ngIf]', exportAs: 'ngIf', inputs: ['ngIf'] },
        { selector: '[ngFor][ngForOf]', exportAs: 'ngFor', inputs: ['ngForTemplate', 'ngForOf'] },
        { selector: '[ngSwitch]', exportAs: 'ngSwitch', inputs: ['ngSwitch'] }
    ],
    logLevel: BUILD_TYPE === 'dev' ? exports.LogLevel.Debug : exports.LogLevel.None
};
try {
    var root = require('app-root-path');
    var newConfig = require(root.path + '/.codelyzer');
    Object.assign(exports.Config, newConfig);
}
catch (e) { }
