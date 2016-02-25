# ng2lint

A set of tslint rules for static code analysis of Angular 2 TypeScript projects.

## Recommended configuration

Below you can find a recommended configuration which is based on the [Angular 2 Style Guide](https://github.com/mgechev/angular2-style-guide).

```json
{
  "directive-selector-name": [true, "camelCase"],
  "component-selector-name": [true, "kebab-case"],
  "directive-selector-type": [true, "attribute"],
  "component-selector-type": [true, "element"],
  "directive-selector-prefix": [true, "sg"],
  "component-selector-prefix": [true, "sg"],
  "host-parameter-decorator": true,
  "input-parameter-decorator": true,
  "output-parameter-decorator": true
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
- [ ] Do not use `nativeElement` injected with `ElementRef`.
- [ ] Do not rename inputs.
- [ ] Do not rename outputs.
- [ ] Externalize template above *n* lines of code.
- [ ] Do not use the `@Attribute` decorator.
- [ ] Do not use `forwardRef`.
- [ ] Rise a warning for impure pipes.
- [ ] Do not declare global providers.
- [ ] Follow convention for naming the routes.
- [ ] Use `@Injectable` instead of `@Inject`.
- [ ] Single export per module, except facade modules.
- [ ] Proper naming of modules (kebab-case followed by module type followed by extension for regular modules, module name plus extension name for facades).
- [ ] Verify if used directive is declared in the current component or any parent component.
- [ ] Verify that property or method used in the template exists in the current context.
- [ ] Proper naming of directives and components (name plus `(Directive|Component)` suffix).
- [ ] Locate component templates in the same directory.
- [ ] Locate tests in the same directory (rise optional warning when no test file is found).
- [ ] Rise warning on complex logic inside of the templates.
- [ ] Do not manipulate elements referenced within the template.
- [ ] Implement life-cycle hooks explicitly.
- [ ] Implement Pipe transform interface for pipes.
- [ ] Proper naming for pipes (kebab-case, optionally prefixed).

## License

MIT
