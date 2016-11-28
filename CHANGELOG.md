# 2.0.0-beta.1

### Breaking Changes

- The rules `directive-selector-name`, `component-selector-name`, `directive-selector-type`, `component-selector-type`, `component-selector-prefix`, `directive-selector-prefix` no longer exist. Instead use:

    ```js
    // The rule have the following arguments:
    // [ENABLED, "attribute" | "element", "selectorPrefix" | ["listOfPrefixes"], "camelCase" | "kebab-case"]
    "directive-selector": [true, "attribute", "sg", "camelCase"],
    "component-selector": [true, "element", "sg", "kebab-case"],
    ```

### Features

- External template support via command line interface. Note that the VSCode tslint plugin cannot report warnings in CSS and HTML files yet [#94](https://github.com/mgechev/codelyzer/issues/94) [67d5a07](https://github.com/mgechev/codelyzer/commit/67d5a07a56163f05e1e3d49e446fa6b0fde15ea2)
- Support for custom hooks for transpilation of languages which transpile to HTML, CSS [#164](https://github.com/mgechev/codelyzer/issues/164) [1ca7068](https://github.com/mgechev/codelyzer/commit/1ca7068e5e29c5608c081958fe259cbc8a09c412)
- Source map support. You can have pug templates and get error reporting in the correct position if inside of the hook you return not only the transpiled version of the template but also the source map [1ca7068](https://github.com/mgechev/codelyzer/commit/1ca7068e5e29c5608c081958fe259cbc8a09c412)
- Optional configuration file `.codelyzer.js` which should be located in the root of your project (the directory where `node_modules` is) [1ca7068](https://github.com/mgechev/codelyzer/commit/1ca7068e5e29c5608c081958fe259cbc8a09c412)
- Support for tslint ^4.0.0 [#157](https://github.com/mgechev/codelyzer/issues/157) [8c5dbf6](https://github.com/mgechev/codelyzer/commit/8c5dbf67093e8ed38cfc2c78036c1f7e04316059)
- Improve `no-unused-css` [0a9d9014](https://github.com/mgechev/codelyzer/pull/121/commits/0a9d90143645dafc34192b7a89bc2f592ce7728f)

### Bug Fixes

- Do not throw error when validating `@Pipe`s without metadata [#111](https://github.com/mgechev/codelyzer/issues/111) [eb6ccc0d](https://github.com/mgechev/codelyzer/commit/eb6ccc0dcc85762c6af2a02172b65c34bdb85c9a)
- Use proper syntax types for TypeScript 2.1.x [#145](https://github.com/mgechev/codelyzer/issues/145) [d49cc26](https://github.com/mgechev/codelyzer/commit/d49cc26bb7d554da55ae71cda8a9fba0ff522d10<Paste>)
- More consistent naming for selector-related rules [#79](https://github.com/mgechev/codelyzer/issues/79) [3373dff](https://github.com/mgechev/codelyzer/commit/3373dffe7962f5e919161d60bc152f0d82dcb5d2)
- Support for templateRefs [#151](https://github.com/mgechev/codelyzer/issues/151) [52ba382](https://github.com/mgechev/codelyzer/commit/52ba38293a565ed8a901474cd26f7fc65adfaa0f)
- Support for properties declared inline into the constructor [#153](https://github.com/mgechev/codelyzer/issues/153) [23fe633](https://github.com/mgechev/codelyzer/commit/23fe633ec80dc1da4c6c8b5de318036654deb3de)
- Report missing styles in the correct position [#166](https://github.com/mgechev/codelyzer/issues/166) [ e9575fb](https://github.com/mgechev/codelyzer/commit/e9575fbe30f932c29fce6a870ba2d8e194700a87)
- Proper selector prefix matching [#103](https://github.com/mgechev/codelyzer/issues/103) [7285121](https://github.com/mgechev/codelyzer/commit/72851217d27a355b117ae1909b47e9a78f0de086)
- Selectors compatible with the spec [#15](https://github.com/mgechev/codelyzer/issues/15) [3373dffe](https://github.com/mgechev/codelyzer/commit/3373dffe7962f5e919161d60bc152f0d82dcb5d2)


# 1.0.0-beta.4

### Bug Fixes

- Migrate to the compiler API changes introduced by Angular 2.2 [#152](https://github.com/mgechev/codelyzer/issues/152) [fe3083b](https://github.com/mgechev/codelyzer/commit/fe3083bd9e106cf8338a743d8bf2c52774e20152)

# 1.0.0-beta.3

### Features

- Introduce support for unused CSS styles in components.

### Bug Fixes

- Migrate to API changes introduced by Angular 2.1.1 [#128](https://github.com/mgechev/codelyzer/issues/128) [787ff3b](https://github.com/mgechev/codelyzer/pull/124/commits/787ff3bad21be0309896ef6a7508e2bb1e8991fc).
- Do not consider `$event` as non-declared variable [#129](https://github.com/mgechev/codelyzer/issues/129) [8751184](https://github.com/mgechev/codelyzer/pull/124/commits/875118402a3cd051085499ac3403a7caad450860).
- Consider template variables such as `let foo of bars` [#123](https://github.com/mgechev/codelyzer/issues/123) [cbd86e1](https://github.com/mgechev/codelyzer/pull/124/commits/cbd86e1925410f647c82ae6a05db249996483585).
- Consider getters and setters when listing all the declared in controller symbols [#118](https://github.com/mgechev/codelyzer/issues/118) [6060ce0](https://github.com/mgechev/codelyzer/pull/124/commits/6060ce0442a22c8dfb694138b51854f721fd00ef).

# 1.0.0-beta.2

### Bug Fixes

- Migrate to the compiler API changes introduced by Angular 2.1.

# 1.0.0-beta.1

### Features

- Add contributing guidelines [#32](https://github.com/mgechev/codelyzer/issues/32) [ff2dc85](https://github.com/mgechev/codelyzer/commit/ff2dc854b4eab5abfc8ee1af9117f0fbf90c53da).

### Bug Fixes

- Do not process webpack dynamically injected templates [#106](https://github.com/mgechev/codelyzer/issues/106) [ff2dc85](https://github.com/mgechev/codelyzer/commit/ff2dc854b4eab5abfc8ee1af9117f0fbf90c53da).
- Do not process `@Component` decorators which are not invoked as expressions [#110](https://github.com/mgechev/codelyzer/issues/110) [5ee2422](https://github.com/mgechev/codelyzer/commit/5ee2422d71b7cb1ff25014ec65a0dba1ae59d9dc)
- Preserve the original interpolation expression [#99](https://github.com/mgechev/codelyzer/issues/99) [5ee2422](https://github.com/mgechev/codelyzer/commit/5ee2422d71b7cb1ff25014ec65a0dba1ae59d9dc).
- Consider both property access and method invocation when deciding if property is used or not [#97](https://github.com/mgechev/codelyzer/issues/97) [da15305](https://github.com/mgechev/codelyzer/commit/da153056fd8f23bf2f9839a5bd1c7d99d30552a7).
- Migrate to the changes introduced by Angular 2.0.2 [#107](https://github.com/mgechev/codelyzer/issues/107) [06483ce](https://github.com/mgechev/codelyzer/commit/06483cedd266701068d3489b04154c4ecd1244bb).

# 1.0.0-beta.0

### Features

- Linting over inline templates [#90](https://github.com/mgechev/codelyzer/pull/90) [4347d09](https://github.com/mgechev/codelyzer/commit/4347d09f2fba54775e855ac0ca6a4ee11249c957).
- Use `Injectable()` instead of `Injectable` [#70](https://github.com/mgechev/codelyzer/issues/70) [c84df93](https://github.com/mgechev/codelyzer/commit/c84df939e83654311311fbad8c889fc65c3fcc95).
- Show warning when binding to non-public class members [#87](https://github.com/mgechev/codelyzer/issues/87) [c849808](https://github.com/mgechev/codelyzer/commit/c8498086ff50eea0e4fefba67c957e2e70237a2f).
- Support for TypeScript 2.1.0 [#72](https://github.com/mgechev/codelyzer/issues/72) [a002661](https://github.com/mgechev/codelyzer/commit/a002661381f2dc20c424e7abad72a8656021fff6).

### Bug Fixes

- On non-implemented life-cycle hook/`PipeTransform` interface, mark only the corresponding method [#89](https://github.com/mgechev/codelyzer/issues/89) [a9104b2](https://github.com/mgechev/codelyzer/commit/a9104b2b575501edb846d865ab8522e59248d2a3).
- Do not throw error when interface is implemented but under a namespace [#91](https://github.com/mgechev/codelyzer/issues/91) [a9104b2](https://github.com/mgechev/codelyzer/commit/a9104b2b575501edb846d865ab8522e59248d2a3).

### Refactoring

- Migrate from typings to `@types` [f9cc498](https://github.com/mgechev/codelyzer/commit/f9cc49851312b0d9bbbbaa8fa323238fddfacf78).

