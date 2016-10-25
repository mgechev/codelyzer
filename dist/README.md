[![Build Status](https://travis-ci.org/mgechev/codelyzer.svg?branch=master)](https://travis-ci.org/mgechev/codelyzer)
[![Gitter Chat](https://camo.githubusercontent.com/da2edb525cde1455a622c58c0effc3a90b9a181c/68747470733a2f2f6261646765732e6769747465722e696d2f4a6f696e253230436861742e737667)](https://gitter.im/mgechev/codelyzer)

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
npm i codelyzer tslint typescript @angular/core@2.0.2 @angular/compiler@2.0.2 rxjs@5.0.0-beta.12 zone.js@0.6.21
```

Now create the following `tslint.json` file where your `node_modules` directory is:

```json
{
  "rulesDirectory": [
    "node_modules/codelyzer"
  ],
  "rules":{
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

