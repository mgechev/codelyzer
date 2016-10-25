import {WebLinter} from './web-linter';

const rulesConfig = {
  "directive-selector-name": [true, "camelCase"],
  "component-selector-name": [true, "kebab-case"],
  "directive-selector-type": [true, "attribute"],
  "component-selector-type": [true, "element"],
  "use-input-property-decorator": true,
  "use-output-property-decorator": true,
  "use-host-property-decorator": true,
  "no-input-rename": true,
  "no-output-rename": true,
  "use-life-cycle-interface": true,
  "use-pipe-transform-interface": true,
  "component-class-suffix": true,
  "directive-class-suffix": true,
  "import-destructuring-spacing": true,
  "templates-use-public": true,
  "no-access-missing-member": true,
  "invoke-injectable": true,
  "no-unused-css": true
};

const linter = new WebLinter();

self.addEventListener('message', (e: any) => {
  const file = e.data;
  linter.lint('file.ts', file, []);
});
