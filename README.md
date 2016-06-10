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

Now you can apply codelyzer rules to your tslint config. Enjoy!

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
  "no-forward-ref" :true,
  "use-life-cycle-interface": true,
  "use-pipe-transform-interface": true,
  "pipe-naming": [true, "camelCase", "sg"],
  "component-class-suffix": true,
  "directive-class-suffix": true,
  "import-destructuring-spacing": true
}
```

## Roadmap

- [x] Directive selector type.
- [x] Directive selector name convention.
- [x] Directive selector name prefix.
- [x] Component selector type.
- [x] Component selector name convention.
- [x] Component selector name prefix.
- [x] Use `@Input` instead of `inputs` decorator property.
- [x] Use `@Output` instead of `outputs` decorator property.
- [x] Use `@HostListeners` and `@HostBindings` instead of `host` decorator property.
- [x] Implement life-cycle hooks explicitly.
- [x] Implement Pipe transform interface for pipes.
- [x] Proper naming for pipes (kebab-case, optionally prefixed).
- [x] Do not rename outputs.
- [x] Do not rename inputs.
- [x] Do not use `forwardRef`.
- [x] Do not use the `@Attribute` decorator.
- [x] Proper naming of directives and components (name plus `(Directive|Component)` suffix).
- [ ] Do not use `nativeElement` injected with `ElementRef`.
- [ ] Externalize template above *n* lines of code.
- [ ] Rise a warning for impure pipes.
- [ ] Do not declare global providers.
- [ ] Follow convention for naming the routes.
- [ ] Use `@Injectable` instead of `@Inject`.
- [ ] Single export per module, except facade modules.
- [ ] Proper naming of modules (kebab-case followed by module type followed by extension for regular modules, module name plus extension name for facades).
- [ ] Verify if used directive is declared in the current component or any parent component.
- [ ] Verify that property or method used in the template exists in the current context.
- [ ] Locate component templates in the same directory.
- [ ] Locate tests in the same directory (rise optional warning when no test file is found).
- [ ] Rise warning on complex logic inside of the templates.
- [ ] Do not manipulate elements referenced within the template.

## License

MIT

