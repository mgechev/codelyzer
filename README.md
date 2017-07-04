[![Build Status](https://travis-ci.org/mgechev/codelyzer.svg?branch=master)](https://travis-ci.org/mgechev/codelyzer)
[![Build status](https://ci.appveyor.com/api/projects/status/7xj7qs0a0h0ald53?svg=true)](https://ci.appveyor.com/project/mgechev/codelyzer)
[![Gitter Chat](https://camo.githubusercontent.com/da2edb525cde1455a622c58c0effc3a90b9a181c/68747470733a2f2f6261646765732e6769747465722e696d2f4a6f696e253230436861742e737667)](https://gitter.im/mgechev/codelyzer)

<p align="center">
  <img src="https://raw.githubusercontent.com/mgechev/codelyzer/master/assets/logo.png" alt="" width="300">
</p>

# Codelyzer

[![](http://s32.postimg.org/vo1xrbgw5/codelyzer.png)](https://youtu.be/bci-Z6nURgE)

A set of tslint rules for static code analysis of Angular TypeScript projects.

You can run the static code analyzer over web apps, NativeScript, Ionic, etc.

## How to use?

### Angular CLI

[Angular CLI](https://cli.angular.io) has support for codelyzer. In order to validate your code with CLI and the custom Angular specific rules just use:

```
ng new codelyzer
ng lint
```

Note that by default all components are aligned with the style guide so you won't see any errors in the console.

### Angular Seed

Another project which has out of the box integration with codelyzer is [angular-seed](https://github.com/mgechev/angular-seed). In order to run the linter you should:

```shell
# Skip if you've already cloned Angular Seed
git clone https://github.com/mgechev/angular-seed

# Skip if you've already installed all the dependencies of Angular Seed
cd angular-seed && npm i

# Run all the tslint and codelyzer rules
npm run lint
```

Note that by default all components are aligned with the style guide so you won't see any errors in the console.

### Custom Setup

You can easily use codelyzer with your custom setup:

#### Installation

```shell
npm i codelyzer@~3.1.0 tslint@^5.0.0 typescript@^2.1.4 @angular/core@4.2.1 @angular/compiler@4.2.1 rxjs@5.0.1 zone.js@0.8.4
```

A. Using codelyzer package in PATH

Create the following `tslint.json` file like:

```json
{
  "extends": [ "codelyzer" ],
  "rules":{
    "angular-whitespace": [true, "check-interpolation", "check-pipe", "check-semicolon"],
    "banana-in-box": true,
    "templates-no-negated-async": true,
    "directive-selector": [true, "attribute", "sg", "camelCase"],
    "component-selector": [true, "element", "sg", "kebab-case"],
    "use-input-property-decorator": true,
    "use-output-property-decorator": true,
    "use-host-property-decorator": true,
    "use-view-encapsulation": true,
    "no-attribute-parameter-decorator": true,
    "no-input-rename": true,
    "no-output-rename": true,
    "no-forward-ref": true,
    "use-life-cycle-interface": true,
    "use-pipe-transform-interface": true,
    "pipe-naming": [true, "camelCase", "sg"],
    "component-class-suffix": true,
    "directive-class-suffix": true,
    "templates-use-public": true,
    "no-access-missing-member": true,
    "invoke-injectable": true,
    "template-to-ng-template": true
  }
}
```

To run TSLint with this setup you can use one of the following alternatives:

1. Install codelyzer globally `npm install -g codelyzer`

2. Run TSLint from a package.json script by adding a script like `tslint .` to your package.json, similar to:
```
"scripts": {
  ...
  "lint": "tslint .",
  ...
},
```
Then run `npm run lint`

B. Using codelyzer from node_modules directory

Now create the following `tslint.json` file where your `node_modules` directory is:

```json
{
  "rulesDirectory": [
    "node_modules/codelyzer"
  ],
  "rules":{
    "angular-whitespace": [true, "check-interpolation", "check-pipe"],
    "banana-in-box": true,
    "templates-no-negated-async": true,
    "directive-selector": [true, "attribute", "sg", "camelCase"],
    "component-selector": [true, "element", "sg", "kebab-case"],
    "use-input-property-decorator": true,
    "use-output-property-decorator": true,
    "use-host-property-decorator": true,
    "no-attribute-parameter-decorator": true,
    "no-input-rename": true,
    "no-output-rename": true,
    "no-forward-ref": true,
    "use-view-encapsulation": true,
    "use-life-cycle-interface": true,
    "use-pipe-transform-interface": true,
    "pipe-naming": [true, "camelCase", "sg"],
    "component-class-suffix": true,
    "directive-class-suffix": true,
    "templates-use-public": true,
    "no-access-missing-member": true,
    "invoke-injectable": true,
    "template-to-ng-template": true
  }
}
```

Next you can create a component file in the same directory with name `component.ts` and the following content:

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'codelyzer',
  template: `
    <h1>Hello {{ nme }}!</h1>
  `
})
class Codelyzer {
  name: string = 'World';

  ngOnInit() {
    console.log('Initialized');
  }
}
```

As last step you can execute all the rules against your code with tslint:

```shell
$ ./node_modules/.bin/tslint -c tslint.json component.ts
```

You should see the following output:

```
component.ts[4, 13]: The selector of the component "Codelyzer" should have prefix "sg" (https://goo.gl/cix8BY)
component.ts[12, 3]: Implement lifecycle hook interface OnInit for method ngOnInit in class Codelyzer (https://goo.gl/w1Nwk3)
component.ts[9, 7]: The name of the class Codelyzer should end with the suffix Component (https://goo.gl/5X1TE7)
component.ts[6, 18]: The property "nme" that you're trying to access does not exist in the class declaration. Probably you mean: "name".
```

### Editor Configuration

**Note that you need to have tslint plugin install on your editor**.

Codelyzer should work out of the box with Atom but for VSCode you will have to open `Code > Preferences > User Settings`, and enter the following config:

```json
{
  "tslint.rulesDirectory": "./node_modules/codelyzer",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

Now you should have the following result:

![VSCode Codelyzer](http://gifyu.com/images/cd.gif)

Enjoy!

## Changelog

You can find it [here](https://github.com/mgechev/codelyzer/blob/master/CHANGELOG.md).

## Recommended configuration

Below you can find a recommended configuration which is based on the [Angular Style Guide](https://angular.io/styleguide).

```js
{
  // The rule have the following arguments:
  // [ENABLED, "attribute" | "element", "selectorPrefix" | ["listOfPrefixes"], "camelCase" | "kebab-case"]
  "directive-selector": [true, "attribute", ["dir-prefix1", "dir-prefix2"], "camelCase"],
  "component-selector": [true, "element", ["cmp-prefix1", "cmp-prefix2"], "kebab-case"],

  "use-input-property-decorator": true,
  "use-output-property-decorator": true,
  "use-host-property-decorator": true,
  "no-attribute-parameter-decorator": true,
  "no-input-rename": true,
  "no-output-rename": true,
  "no-forward-ref": true,
  "use-life-cycle-interface": true,
  "use-pipe-transform-interface": true,

  // [ENABLED, "SUFFIX"]
  // Where "SUFFIX" is your custom suffix, for instance "Page" for Ionic 2 components.
  "component-class-suffix": [true, "Component"],
  "directive-class-suffix": [true, "Directive"],
  "templates-use-public": true,
  "no-access-missing-member": true,
  "invoke-injectable": true
}
```

## Advanced configuration

Codelyzer supports any template and style language by custom hooks. If you're using Sass for instance, you can allow codelyzer to analyze your styles by creating a file `.codelyzer.js` in the root of your project (where the `node_modules` directory is). In the configuration file can implement custom pre-processing and template resolution logic:

```js
// Demo of transforming Sass styles
var sass = require('node-sass');

module.exports = {

  // Definition of custom interpolation strings
  interpolation: ['{{', '}}'],

  // You can transform the urls of your external styles and templates
  resolveUrl(url, decorator) {
    return url;
  },

  // Transformation of the templates. This hooks is quite useful
  // if you're using any other templating language, for instance
  // jade, markdown, haml, etc.
  //
  // NOTE that this method WILL NOT throw an error in case of invalid template.
  //
  transformTemplate(code, url, decorator) {
    return { code: code, url: url };
  },

  // Transformation of styles. This hook is useful is you're using
  // any other style language, for instance Sass, Less, etc.
  //
  // NOTE that this method WILL NOT throw an error in case of invalid style.
  //
  transformStyle(code, url, decorator) {
    var result = { code: code, url: url };
    if (url && /\.scss$/.test(url)) {
      var transformed = sass.renderSync({ data: code, sourceMap: true, outFile: '/dev/null' });
      result.source = code;
      result.code = transformed.css.toString();
      result.map = transformed.map.toString();
    }
    return result;
  },

  // Custom predefined directives in case you get error for
  // missing property and you are using a template reference
  predefinedDirectives: [
    { selector: 'form', exportAs: 'ngForm' }
  ],

  // None = 0b000, Error = 0b001, Info = 0b011, Debug = 0b111
  logLevel: 0b111
};
```

## Contributors

[<img alt="mgechev" src="https://avatars2.githubusercontent.com/u/455023?v=3&s=117" width="117">](https://github.com/mgechev) |[<img alt="preslavsh" src="https://avatars1.githubusercontent.com/u/6237138?v=3&s=117" width="117">](https://github.com/preslavsh) |[<img alt="GregOnNet" src="https://avatars0.githubusercontent.com/u/444278?v=3&s=117" width="117">](https://github.com/GregOnNet) |[<img alt="wKoza" src="https://avatars1.githubusercontent.com/u/11403260?v=3&s=117" width="117">](https://github.com/wKoza) |[<img alt="eppsilon" src="https://avatars2.githubusercontent.com/u/5643?v=3&s=117" width="117">](https://github.com/eppsilon) |[<img alt="ghsyeung" src="https://avatars3.githubusercontent.com/u/1243185?v=3&s=117" width="117">](https://github.com/ghsyeung) |
:---: |:---: |:---: |:---: |:---: |:---: |
[mgechev](https://github.com/mgechev) |[preslavsh](https://github.com/preslavsh) |[GregOnNet](https://github.com/GregOnNet) |[wKoza](https://github.com/wKoza) |[eppsilon](https://github.com/eppsilon) |[ghsyeung](https://github.com/ghsyeung) |

[<img alt="Kobzol" src="https://avatars3.githubusercontent.com/u/4539057?v=3&s=117" width="117">](https://github.com/Kobzol) |[<img alt="lazarljubenovic" src="https://avatars0.githubusercontent.com/u/7661457?v=3&s=117" width="117">](https://github.com/lazarljubenovic) |[<img alt="clydin" src="https://avatars1.githubusercontent.com/u/19598772?v=3&s=117" width="117">](https://github.com/clydin) |[<img alt="connor4312" src="https://avatars3.githubusercontent.com/u/2230985?v=3&s=117" width="117">](https://github.com/connor4312) |[<img alt="Foxandxss" src="https://avatars1.githubusercontent.com/u/1087957?v=3&s=117" width="117">](https://github.com/Foxandxss) |[<img alt="Hotell" src="https://avatars3.githubusercontent.com/u/1223799?v=3&s=117" width="117">](https://github.com/Hotell) |
:---: |:---: |:---: |:---: |:---: |:---: |
[Kobzol](https://github.com/Kobzol) |[lazarljubenovic](https://github.com/lazarljubenovic) |[clydin](https://github.com/clydin) |[connor4312](https://github.com/connor4312) |[Foxandxss](https://github.com/Foxandxss) |[Hotell](https://github.com/Hotell) |

[<img alt="comfroels" src="https://avatars1.githubusercontent.com/u/4616177?v=3&s=117" width="117">](https://github.com/comfroels) |[<img alt="plantain-00" src="https://avatars3.githubusercontent.com/u/7639395?v=3&s=117" width="117">](https://github.com/plantain-00) |[<img alt="nexus-uw" src="https://avatars1.githubusercontent.com/u/3188890?v=3&s=117" width="117">](https://github.com/nexus-uw) |[<img alt="Manduro" src="https://avatars3.githubusercontent.com/u/2545042?v=3&s=117" width="117">](https://github.com/Manduro) |[<img alt="karol-depka" src="https://avatars2.githubusercontent.com/u/958486?v=3&s=117" width="117">](https://github.com/karol-depka) |[<img alt="leosvelperez" src="https://avatars0.githubusercontent.com/u/12051310?v=3&s=117" width="117">](https://github.com/leosvelperez) |
:---: |:---: |:---: |:---: |:---: |:---: |
[comfroels](https://github.com/comfroels) |[plantain-00](https://github.com/plantain-00) |[nexus-uw](https://github.com/nexus-uw) |[Manduro](https://github.com/Manduro) |[karol-depka](https://github.com/karol-depka) |[leosvelperez](https://github.com/leosvelperez) |

[<img alt="rtfpessoa" src="https://avatars3.githubusercontent.com/u/902384?v=3&s=117" width="117">](https://github.com/rtfpessoa) |[<img alt="scttcper" src="https://avatars0.githubusercontent.com/u/1400464?v=3&s=117" width="117">](https://github.com/scttcper) |[<img alt="laco0416" src="https://avatars0.githubusercontent.com/u/1529180?v=3&s=117" width="117">](https://github.com/laco0416) |[<img alt="tmair" src="https://avatars1.githubusercontent.com/u/1596276?v=3&s=117" width="117">](https://github.com/tmair) |
:---: |:---: |:---: |:---: |
[rtfpessoa](https://github.com/rtfpessoa) |[scttcper](https://github.com/scttcper) |[laco0416](https://github.com/laco0416) |[tmair](https://github.com/tmair) |

## License

MIT

