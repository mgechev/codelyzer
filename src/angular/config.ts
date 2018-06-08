import { CodeWithSourceMap } from './metadata';

export interface StyleTransformer {
  (style: string, url?: string): CodeWithSourceMap;
}

export interface TemplateTransformer {
  (template: string, url?: string): CodeWithSourceMap;
}

export interface UrlResolver {
  (url: string | null): string | null;
}

export const LogLevel = { Debug: 0b111, Error: 0b001, Info: 0b011, None: 0 };

export interface Config {
  interpolation: [string, string];
  logLevel: number;
  predefinedDirectives: DirectiveDeclaration[];
  resolveUrl: UrlResolver;
  transformStyle: StyleTransformer;
  transformTemplate: TemplateTransformer;
}

export interface DirectiveDeclaration {
  exportAs?: string;
  hostAttributes?: string[];
  hostListeners?: string[];
  hostProperties?: string[];
  inputs?: string[];
  outputs?: string[];
  selector: string;
}

let BUILD_TYPE = '<%= BUILD_TYPE %>';

const transform = (code: string, extension: '.css' | '.html', url?: string): { code: string; url?: string } => {
  return { code: !url || url.endsWith(extension) ? code : '', url };
};

export const Config: Config = {
  interpolation: ['{{', '}}'],

  logLevel: BUILD_TYPE === 'dev' ? LogLevel.Debug : LogLevel.None,

  predefinedDirectives: [
    { selector: 'form:not([ngNoForm]):not([formGroup]), ngForm, [ngForm]', exportAs: 'ngForm' },
    { selector: '[routerLinkActive]', exportAs: 'routerLinkActive' },
    { selector: '[ngModel]:not([formControlName]):not([formControl])', exportAs: 'ngModel' },
    { selector: '[ngIf]', exportAs: 'ngIf', inputs: ['ngIf'] },
    { selector: '[ngFor][ngForOf]', exportAs: 'ngFor', inputs: ['ngForTemplate', 'ngForOf'] },
    { selector: '[ngSwitch]', exportAs: 'ngSwitch', inputs: ['ngSwitch'] },
    { selector: '[ngSwitchCase]', exportAs: 'ngSwitchCase', inputs: ['ngSwitchCase'] },
    { selector: '[ngSwitchDefault]', exportAs: 'ngSwitchDefault', inputs: ['ngSwitchDefault'] },

    // @angular/material
    { selector: 'mat-autocomplete', exportAs: 'matAutocomplete' },
    { selector: '[mat-menu-item]', exportAs: 'matMenuItem' },
    { selector: 'mat-menu', exportAs: 'matMenu' },
    { selector: 'mat-button-toggle-group:not([multiple])', exportAs: 'matButtonToggleGroup' },
    { selector: '[mat-menu-trigger-for], [matMenuTriggerFor]', exportAs: 'matMenuTrigger' },
    { selector: '[mat-tooltip], [matTooltip]', exportAs: 'matTooltip' },
    { selector: 'mat-select', exportAs: 'matSelect' },
    // The `md-` prefix is deprecated since beta.11, removed since beta.12
    { selector: '[md-menu-item]', exportAs: 'mdMenuItem' },
    { selector: 'md-menu', exportAs: 'mdMenu' },
    { selector: 'md-button-toggle-group:not([multiple])', exportAs: 'mdButtonToggleGroup' },
    { selector: '[md-menu-trigger-for], [mdMenuTriggerFor]', exportAs: 'mdMenuTrigger' },
    { selector: '[md-tooltip], [mdTooltip]', exportAs: 'mdTooltip' },
    { selector: 'md-select', exportAs: 'mdSelect' }
  ],

  resolveUrl(url: string | null) {
    return url;
  },

  transformStyle: (code: string, url?: string) => transform(code, '.css', url),

  transformTemplate: (code: string, url?: string) => transform(code, '.html', url)
};

try {
  const root = require('app-root-path');
  const newConfig = require(root.path + '/.codelyzer');
  Object.assign(Config, newConfig);
} catch {}
