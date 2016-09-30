[![Build Status](https://travis-ci.org/mgechev/codelyzer.svg?branch=master)](https://travis-ci.org/mgechev/codelyzer)
[![Gitter Chat](https://camo.githubusercontent.com/da2edb525cde1455a622c58c0effc3a90b9a181c/68747470733a2f2f6261646765732e6769747465722e696d2f4a6f696e253230436861742e737667)](https://gitter.im/mgechev/codelyzer)

# Codelyzer

[![](http://s32.postimg.org/vo1xrbgw5/codelyzer.png)](https://youtu.be/bci-Z6nURgE)

A set of tslint rules for static code analysis of Angular 2 TypeScript projects.

You can run the static code analyzer over web apps, NativeScript, Ionic, etc.

## Install

`npm install --save-dev codelyzer`

Then hop to your `tslint.json` and add rulesDirectory which points to codelyzer, like this:
```json
{
  "rulesDirectory": [
    "node_modules/codelyzer"
  ],
  "rules":{
  }
}
```

Now you can apply codelyzer rules to your tslint config.

In order to run the rules through tslint use:

```bash
tslint -c tslint.json **/*.ts
```

Enjoy!

## Recommended configuration

Below you can find a recommended configuration which is based on the [Angular 2 Style Guide](https://angular.io/styleguide).

```json
{
  "directive-selector-name": [true, "camelCase"],
  "component-selector-name": [true, "kebab-case"],
  "directive-selector-type": [true, "attribute"],
  "component-selector-type": [true, "element"],
  "directive-selector-prefix": [true, "sg"],
  "component-selector-prefix": [true, "sg"],
  "use-input-property-decorator": true,
  "use-output-property-decorator": true,
  "use-host-property-decorator": true,
  "no-attribute-parameter-decorator": true,
  "no-input-rename": true,
  "no-output-rename": true,
  "no-forward-ref": true,
  "use-life-cycle-interface": true,
  "use-pipe-transform-interface": true,
  "pipe-naming": [true, "camelCase", "sg"],
  "component-class-suffix": true,
  "directive-class-suffix": true,
  "import-destructuring-spacing": true,
  "templates-use-public": true,
  "no-access-missing-member": true,
  "invoke-injectable": true
}
```

## License

MIT

