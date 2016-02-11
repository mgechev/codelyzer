# ng2lint

A set of tslint rules for static code analysis of Angular 2 TypeScript projects.

## Recommended configuration

Below you can find a recommended configuration which is based on the [Angular 2 Style Guide](https://github.com/mgechev/angular2-style-guide).

```json
{
  "directive-selector": [true, "attribute", "camelCase", "sg"],
  "component-selector": [true, "element", "kebab-case", "sg"],
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
- [ ] Do not inject `ElementRef`.
- [ ] Do not rename inputs.
- [ ] Do not rename outputs.
- [ ] Externalize template above *n* lines of code.
- [ ] Do not use the `@Attribute` decorator.
- [ ] Do not use `forwardRef`.
- [ ] Rise a warning for impure pipes.
- [ ] Do not declare global providers.
- [ ] Follow convention for naming the routes.
- [ ] Use `@Injectable` instead of `@Inject`.

## License

MIT