# 3.0.0-rc.0

### Breaking Changes

- Remove `importDestructuringSpacing`.
- `no-access-missing-member`, `use-life-cycle-interface` and `template-use-public` require type checking which means that tslint should be run with [the corresponding options](https://github.com/palantir/tslint#type-checking)

### Features

- `no-access-missing-member` support for inheritance [#191](https://github.com/mgechev/codelyzer/issues/191) [2901718](https://github.com/mgechev/codelyzer/commit/2901718d93633284be59ae04c1b00a99df7cf885)
- `use-life-cycle-interface` support for inheritance [#64](https://github.com/mgechev/codelyzer/issues/64) [d0d7138](https://github.com/mgechev/codelyzer/commit/d0d71387ab322f7bbb612c79bc673fe9dbf4880f)
- `template-use-public` support for inheritance [#240](https://github.com/mgechev/codelyzer/issues/240) [2e285e2](https://github.com/mgechev/codelyzer/commit/2e285e22efb7bdc031ded2721c52cf8e041b9901)

# 2.0.0

### Bug Fixes

- The rule for binding to publich members breaks for readonly properties [#206](https://github.com/mgechev/codelyzer/issues/206) [cc3ed9a](https://github.com/mgechev/codelyzer/commit/cc3ed9a60d7a569f39e4197e541b18dc7ded54b4)
- Add checks for ngIf and ngSwitch [#193](https://github.com/mgechev/codelyzer/issues/193) [0118b56](https://github.com/mgechev/codelyzer/commit/0118b569561d97ad31bd2e7216ad90834091942c)
- Support for tslint@^4.3.1 (4.3.0 was broken) [3e7edfa](https://github.com/mgechev/codelyzer/commit/3e7edfafbc2b3a92045d7eef33c9e5c131681c53)
- Support for Angular 4 [#214](https://github.com/mgechev/codelyzer/issues/214) [4d79933](https://github.com/mgechev/codelyzer/commit/4d799335fc335ec3f0ae2825e54c2dafeb58925d)

### Refactoring

- Refactoring `readTemplate` and `readStyle` to use `Maybe<T>` [373b152](https://github.com/mgechev/codelyzer/commit/373b152a7aa371895e10ae1726aa6f0d7db7146d)

# 2.0.0-beta.4

### Features

- Allow multiple suffixes for better compatibility with Ionic [#194](https://github.com/mgechev/codelyzer/issues/194) [08fdaf0](https://github.com/mgechev/codelyzer/commit/08fdaf089236bd84598957233173867109d7dbcf)
- Add declarations of frequiently used directive declarations [#199](https://github.com/mgechev/codelyzer/issues/199) [36f5cb4](https://github.com/mgechev/codelyzer/commit/36f5cb4efb6d558744a2ee62f4e53e73ee333a04)
- Support for Angular 2.4.x [#201](https://github.com/mgechev/codelyzer/issues/201) [ad81f2d](https://github.com/mgechev/codelyzer/pull/202/commits/ad81f2deae24fe4cd16a754930c1cf6d0291bd36)
- Support for tslint@^4.1.0 [#204](https://github.com/mgechev/codelyzer/issues/204) [13b722e](https://github.com/mgechev/codelyzer/commit/13b722e31d5f53856d2bd98260b425c491cb6894)

### Bug Fixes

- Warn when component element selector doesn't have a dash [#192](https://github.com/mgechev/codelyzer/issues/192) [36f5cb4](https://github.com/mgechev/codelyzer/commit/3d53a187c559067f9d71d364773fb55aedf4a0da)

# 2.0.0-beta.3

### Bug Fixes

- Restrict `peerDependencies` to Angular `<=2.3 >=2.2.0` [#188](https://github.com/mgechev/codelyzer/issues/188) [08a0029](https://github.com/mgechev/codelyzer/commit/08a0029b716252f23a2797ec703b683eb226d753)

# 2.0.0-beta.2

### Features

- Ionic 2 Support [#132](https://github.com/mgechev/codelyzer/issues/132) [a019e3f](https://github.com/mgechev/codelyzer/commit/a019e3fe2ab33e818c67840ed2cff11a51bd02c5)
- Support for TypeScript 2.2.x [#149](https://github.com/mgechev/codelyzer/issues/149) [d5f117e](https://github.com/mgechev/codelyzer/commit/d5f117e19b793405b46102f547ecb14e5643faca)
- Support for Angular 2.3.0 [#182](https://github.com/mgechev/codelyzer/issues/182) [20ce61a](https://github.com/mgechev/codelyzer/commit/20ce61a64346b9ac17a1d5d5f364889ef90e6d47)

### Bug Fixes

- False positive with TypeScript 2.1.4 [#184](https://github.com/mgechev/codelyzer/issues/184) [d5f117e](https://github.com/mgechev/codelyzer/commit/d5f117e19b793405b46102f547ecb14e5643faca)
- Certain Codelyzer Rules hang linting [#181](https://github.com/mgechev/codelyzer/issues/181) [d5f117e](https://github.com/mgechev/codelyzer/commit/d5f117e19b793405b46102f547ecb14e5643faca)
- Do not process non-css & non-html files by default [#186](https://github.com/mgechev/codelyzer/issues/186) [d5f117e](https://github.com/mgechev/codelyzer/commit/d5f117e19b793405b46102f547ecb14e5643faca)
- Handle properly `KeyedRead`s and `KeyadWrite`s [#185](https://github.com/mgechev/codelyzer/issues/185) [20ce61a](https://github.com/mgechev/codelyzer/commit/20ce61a64346b9ac17a1d5d5f364889ef90e6d47)
- False positive of `no-access-missing-member` [#179](https://github.com/mgechev/codelyzer/issues/179) [20ce61a](https://github.com/mgechev/codelyzer/commit/20ce61a64346b9ac17a1d5d5f364889ef90e6d47)
- Atom fatal error from app-root-path [#177](https://github.com/mgechev/codelyzer/pull/177) [5b26419](https://github.com/mgechev/codelyzer/commit/5b264197cb30b4680477116eab8fdd99c1da696e)

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

