import {WebLinter} from './worker/web-linter';
import * as rules from 'codelyzer';

const rulesConfig = {
  'directive-selector-name': [true, 'camelCase'],
  'component-selector-name': [true, 'kebab-case'],
  'directive-selector-type': [true, 'attribute'],
  'component-selector-type': [true, 'element'],
  'use-input-property-decorator': true,
  'use-output-property-decorator': true,
  'use-host-property-decorator': true,
  'no-input-rename': true,
  'no-output-rename': true,
  'use-life-cycle-interface': true,
  'use-pipe-transform-interface': true,
  'component-class-suffix': true,
  'directive-class-suffix': true,
  'import-destructuring-spacing': true,
  'templates-use-public': true,
  'no-access-missing-member': true,
  'invoke-injectable': true,
  'no-unused-css': true
};

const ruleToClass = (ruleName: string) => {
  const result = ruleName.replace(/(\-\w)/g, m => m[1].toUpperCase()) + 'Rule';
  return result[0].toUpperCase() + result.slice(1, result.length);
};

const getRules = (config: any) => {
  return Object.keys(config).map(k => {
    const className = ruleToClass(k);
    const ruleConfig = config[k];
    return new (<any>rules)[className](k, ruleConfig, [])
  });
};

const linter = new WebLinter();

self.addEventListener('message', (e: any) => {
  const config = JSON.parse(e.data);
  linter.lint('file.ts', config.program, getRules(rulesConfig));
  const output = linter.getResult().output;
  (self as any).postMessage(output);
  linter.reset();
});

