# 4.1.0

## Features

- Feature request: no output named after a standard DOM event [#473](https://github.com/mgechev/codelyzer/issues/473) [ae3f07b](https://github.com/mgechev/codelyzer/commit/ae3f07b61eedebe07e2816a29b32ef733febd038)
- Support for Angular Compiler 5.2 [#496](https://github.com/mgechev/codelyzer/issues/496) [6a6b3de](https://github.com/mgechev/codelyzer/commit/6a6b3de0b1943cb5373e12e0fd7d24e7ea29c162)

### Bug Fixes

- i18n check-text edge cases [#442](https://github.com/mgechev/codelyzer/issues/442) [4c1c8d4](https://github.com/mgechev/codelyzer/commit/4c1c8d453da80436890b75bf77ee888cba2d1855)
- Codelyzer hanging for "styles" attribute in Angular component [#446](https://github.com/mgechev/codelyzer/issues/446) [a31c6d2](https://github.com/mgechev/codelyzer/commit/a31c6d2b2726c01f65f33e744b1db4944d941962) and [9c90ac3](https://github.com/mgechev/codelyzer/commit/9c90ac33cea1f947d012b71dcdeffde149b9f965)
- no-output-on-prefix incorrectly throws error if output property name starts with "one" [#480](https://github.com/mgechev/codelyzer/issues/480) [9b844cc](https://github.com/mgechev/codelyzer/commit/9b844cc226ae127145097f94b734f929308d5827)

Thanks to [@gbilodeau](https://github.com/gbilodeau) for `NoOutputNamedAfterStandardEventRule` and [wKoza](https://github.com/wKoza) for the code reviews!

# 4.0.2

### Bug Fixes

- Two issues in `angular-whitespace` related to `check-semicolon` and `check-interpolation` [#469](https://github.com/mgechev/codelyzer/issues/469) [2ef7438](https://github.com/mgechev/codelyzer/pull/470/commits/2ef7438b63829064d2bb9fabe0cd0eb7504fad98)
- Check multiple semicolons inside the directive expressions [#472](https://github.com/mgechev/codelyzer/issues/472) [e6036d2](https://github.com/mgechev/codelyzer/pull/471/commits/e6036d2f757dd1b8f837afef6aea5803acd0cfca)

Thanks to [@sagittarius-rev](https://github.com/sagittarius-rev) for the bug fixes!

# 4.0.1

### Bug Fixes

- Fix `noOutputOnPrefixRule` and rename it to `no-output-on-prefix`. You can now enable it with:

```
"no-output-on-prefix": true
```

- Fix broken tests for `noOutputOnPrefixRule`.

# 4.0.0

### Features

- Support for Angular version 5 [#409](https://github.com/mgechev/codelyzer/issues/409) [0217e2d](https://github.com/mgechev/codelyzer/commit/0217e2dba6a93c93329cbf09ae0fca81af9f05ba)
- Rule for checking the name events without the prefix on https://angular.io/guide/styleguide#dont-prefix-output-properties [#449](https://github.com/mgechev/codelyzer/issues/449) [8f2b4e7](https://github.com/mgechev/codelyzer/commit/8f2b4e765ed0db49d2abf995cd278f09bb35f8c1).

Enable the new rule by adding the following line in your `tslint.json` config file:

```
"no-output-on-prefix-name": true
```

Thanks to [@eromano](https://github.com/eromano) for the rule implementation!


### Breaking Changes

- The rules `templates-use-public`, `no-access-missing-member`, `invoke-injectable` and `template-to-ng-template` no longer exist. Remove them from your `tslint.json` configuration.

# 3.2.1

### Features

- Support for `@angular/compiler@4.4.1` [#416](https://github.com/mgechev/codelyzer/issues/416) [d67f88e](https://github.com/mgechev/codelyzer/pull/418/commits/d67f88eb4005a9b6a300edf0be211990bd65f08f)

### Bug Fixes

- Error while parsing TS file with mixin [#422](https://github.com/mgechev/codelyzer/issues/422) [61d11db](https://github.com/mgechev/codelyzer/commit/61d11dbafb5e1e34ef291de76dbe69c835364882)

# 3.2.0

### Features

- i18n best practices [#377](https://github.com/mgechev/codelyzer/issues/377) [5ef90aa](https://github.com/mgechev/codelyzer/commit/5ef90aa5955294a640fcf4ca8efa402e27a77fd1)
- Add a rule which verifies the use of the life cycle methods according to the type of class (Component, Directive, Service,...) [#363](https://github.com/mgechev/codelyzer/issues/363) [6b042f7](https://github.com/mgechev/codelyzer/pull/388)
- Friendlier checking of validator directive names [#397](https://github.com/mgechev/codelyzer/issues/397) [28ecbdd](https://github.com/mgechev/codelyzer/pull/407)

### Bug Fixes

- Error on validating a pipe with `@Pipe` decorator where we use a shorthand syntax for passing properties [#399](https://github.com/mgechev/codelyzer/issues/399) [8e3fafb](https://github.com/mgechev/codelyzer/commit/8e3fafb9658aec5dd73c7bf4c401457622ad0c99)
- Broken `check-pipe` option of `angular-whitespace` [#365](https://github.com/mgechev/codelyzer/issues/365) [bef790b](https://github.com/mgechev/codelyzer/pull/405)
- Some rules report false positives [#379](https://github.com/mgechev/codelyzer/issues/379) [8719674](https://github.com/mgechev/codelyzer/pull/381) [4721aca](https://github.com/mgechev/codelyzer/pull/401) [bef790b](https://github.com/mgechev/codelyzer/pull/405)


Thanks to [@wKoza](https://github.com/wKoza) for working on the introduced features, bug fixes and code reviews!

# 3.1.2

### Features

- Ensure whitespaces after semicolon in structural dir [#330](https://github.com/mgechev/codelyzer/issues/330) [25667f9](https://github.com/mgechev/codelyzer/commit/25667f9741ba497a70f94e65b7677f0121fda9bc)

Thanks to [@wKoza](https://github.com/wKoza) for code reviews and implementation of `"check-semicolon"`.

`angular-whitespace: [true, "check-semicolon", "check-interpolation", "check-pipe"]` - Checks if there's whitespace after semicolon, around an expression surrounded by interpolation characters, and after a pipe symbol.

### Bug Fixes

- Auto fix for check-interpolation part of angularWhitespace is broken [#345](https://github.com/mgechev/codelyzer/issues/345) [0be8563](https://github.com/mgechev/codelyzer/pull/362)
- check-pipe should ignore i18n meaning and description | separator [#359](https://github.com/mgechev/codelyzer/issues/359) [5aad7f3](https://github.com/mgechev/codelyzer/commit/5aad7f37b967265f831a4b486d73586dc8885a7e)
- check-pipe breaks with ngFor [#346](https://github.com/mgechev/codelyzer/issues/346) [fa08a3b](https://github.com/mgechev/codelyzer/commit/fa08a3be4bf8588336c07c579e6fbfc7d75ae8dd)

# 3.1.1

### Bug Fixes

- Incorrect rule name in documentation [#344](https://github.com/mgechev/codelyzer/issues/344) [6656b81](https://github.com/mgechev/codelyzer/commit/6656b81dfd6466e090776d0bdb9f225169b6b7f0)
- Proper displacement in the reports for non-TypeScript files [#343](https://github.com/mgechev/codelyzer/issues/343) [c503510](https://github.com/mgechev/codelyzer/commit/c5035101957fe1223915968272c42feb47a7c6fa)

# 3.1.0

### New rules

- `angular-whitespace: [true, "check-interpolation", "check-pipe"]` - Checks if there's whitespace around an expression surrounded by interpolation characters, and after a pipe symbol.
- `banana-in-box: true` - Checks for proper banana in a box syntax - `[(ngModel)]` instead of `([ngModel])`.
- `templates-no-negated-async: true` - Enforces `(foo | async) === false`, rather than `!(foo | async)`, because of the initial falsy value emitted.
- `use-view-encapsulation: true` - Enforces enabled view encapsulation.

**Special thanks to [@wKoza](https://github.com/wKoza), [@GregOnNet](https://github.com/GregOnNet) and [@connor4312](https://github.com/connor4312) for their contributions.**

### Features

- Align to the template parser API of Angular compiler 4.1.0 [#301](https://github.com/mgechev/codelyzer/issues/301) [0fcdcd1](https://github.com/mgechev/codelyzer/commit/0fcdcd102431690f78b4bc923881d324534b52e3)
- Align to the changes in the template parser API 4.1.3 [#319](https://github.com/mgechev/codelyzer/issues/319) [b608296](https://github.com/mgechev/codelyzer/commit/b60829663383adcaa8b2570f56242ce34e1d94a1)
- Rule for enforcing `ViewEncapsulation` [#300](https://github.com/mgechev/codelyzer/issues/300) [509c8d9](https://github.com/mgechev/codelyzer/commit/509c8d953f0e03adb8b68b1ba98fdcfcc374152b). Big thanks to @GregOnNet.
- Add a no-negated-async rule [#332](https://github.com/mgechev/codelyzer/issues/332) [0f0924d](https://github.com/mgechev/codelyzer/commit/0f0924d499217a61759f4f1b49fe30a32d0ad197). Big thanks to @connor4312.
- Enforce proper banana in a box syntax [#331](https://github.com/mgechev/codelyzer/issues/331) [f95b2d5](https://github.com/mgechev/codelyzer/pull/322)
- Ensure whitespace around interpolation [#320](https://github.com/mgechev/codelyzer/issues/320) [335776f](https://github.com/mgechev/codelyzer/commit/335776ff24ecc81a743ff0cc70aaf01442462b8a)

### Bug Fixes

- Template micro-syntax closure and 'bind only to public class members' [#220](https://github.com/mgechev/codelyzer/issues/220) [61f9fe9](https://github.com/mgechev/codelyzer/commit/61f9fe9e664ada53518679e8060deba2839793c7)
- Report warnings when bound to private iterable in `*ngFor` [#306](https://github.com/mgechev/codelyzer/issues/306) [36705fc](https://github.com/mgechev/codelyzer/commit/36705fc3b708146880ea14ac0b918af7e67f1401)
- 'templates-use-public' throws error when attempting to access a property of a property with the [] syntax [#315](https://github.com/mgechev/codelyzer/issues/315) [6323d2c](https://github.com/mgechev/codelyzer/commit/6323d2cdf3916d7ab8dfa8f694aaa21a5a68edc3)
- no-access-missing-member doesn't work with external HTML [#311](https://github.com/mgechev/codelyzer/issues/311) [b608296](https://github.com/mgechev/codelyzer/commit/b60829663383adcaa8b2570f56242ce34e1d94a1)
- rules name in documentation aren't consistent [#325](https://github.com/mgechev/codelyzer/issues/325) [7a67607](https://github.com/mgechev/codelyzer/pull/326). Big thanks to @wKoza.
- Our links to angular.io are broken [#333](https://github.com/mgechev/codelyzer/issues/333) [5a532b4](https://github.com/mgechev/codelyzer/pull/334). Big thanks to @wKoza.
- Report errors twice [#336](https://github.com/mgechev/codelyzer/issues/336) [44a9306](https://github.com/mgechev/codelyzer/pull/339)


# 3.0.1

### Bug Fixes

- Export `usePipeDecoratorRule` [#299](https://github.com/mgechev/codelyzer/issues/299) [c5869e0](https://github.com/mgechev/codelyzer/commit/c5869e04cdfedb1c58fac9c0f6bef027a745badf).

# 3.0.0

Major release required because of the breaking changes introduced by tslint@5. The `ngast` support will be pushed to codelyzer@4.

### Features

- Support for tslint@5 [#281](https://github.com/mgechev/codelyzer/issues/281) [01bffd5](https://github.com/mgechev/codelyzer/commit/01bffd559044521967962b2a0cfee31f409e4c2e) [49b1e80](https://github.com/mgechev/codelyzer/commit/49b1e80debc232719ee56c1fbedf63f3a0761549)
- Allow more than one selector kind of directives & components [#290](https://github.com/mgechev/codelyzer/issues/290) [4fa35f6](https://github.com/mgechev/codelyzer/commit/4fa35f6c0b8d9948cc0b5f38997bb11d4e5af8df)
  ```
  "directive-selector": [true, ["attribute", "element"], "sg", "camelCase"],
  "component-selector": [true, ["element", "attribute"], "sg", "kebab-case"],
  ```
- Specs for the support of `as` syntax in expressions [#289](https://github.com/mgechev/codelyzer/issues/289) [a7500cb](https://github.com/mgechev/codelyzer/commit/a7500cb3605f28f65e58e80559a9d3548d95549c)

### Refactoring

- Rename `ng2Walker` to `ngWalker` [01bffd5](https://github.com/mgechev/codelyzer/commit/01bffd559044521967962b2a0cfee31f409e4c2e)
- Refactor selector-related rules to depend on less mutable state [4fa35f6](https://github.com/mgechev/codelyzer/commit/4fa35f6c0b8d9948cc0b5f38997bb11d4e5af8df)

# 2.1.1

### Bug Fixes

- Breaking change in the TypeScript AST regarding `importDestructuringSpacingRule` [#282](https://github.com/mgechev/codelyzer/issues/282) [eebf10a](https://github.com/mgechev/codelyzer/commit/eebf10adc3bd67101a06abfb19d35729a2210d46)

# 2.1.0

### Features

- Automatic removal of dead styles (experimental) [#244](https://github.com/mgechev/codelyzer/issues/244) [30f2667](https://github.com/mgechev/codelyzer/pull/246)
- Warning for the deprecated `<template>` element [#280](https://github.com/mgechev/codelyzer/issues/280) [0d0e81c](https://github.com/mgechev/codelyzer/commit/0d0e81cd501c7aecb59786553e75356d96e03e41)
- Rise a warning if given class implements PipeTransform but is not decorated with @Pipe [#104](https://github.com/mgechev/codelyzer/issues/104) [638e72f](https://github.com/mgechev/codelyzer/pull/271)

### Bug Fixes

- no-unused-css ignores elements with structural directives [#249](https://github.com/mgechev/codelyzer/issues/249) [0aff6b7](https://github.com/tmair/codelyzer/commit/0aff6b7773f8359bc93c78238e1a61aff11c9f56)
- Improve position to line & character and line & character to position [#245](https://github.com/mgechev/codelyzer/issues/245) [30f2667](https://github.com/mgechev/codelyzer/pull/246)

# 3.0.0-beta.4

### Features

- Support for Angular 4.0.0-rc.5 & ngast 0.0.15 [#270](https://github.com/mgechev/codelyzer/issues/270) [35aa900](https://github.com/mgechev/codelyzer/commit/35aa9005c963ef2a302eaef892ee817f0b9101c0)

# 3.0.0-beta.3

### Bug Fixes

- Update peerDependency ngast to version `^0.0.6` [#257](https://github.com/mgechev/codelyzer/issues/257) [30e921a](https://github.com/mgechev/codelyzer/commit/30e921a48fb98b9d929d46f905aa87d3d7e81d98).

# 3.0.0-beta.2

### Bug Fixes

- Update peerDependency ngast to version `^0.0.4` [#257](https://github.com/mgechev/codelyzer/issues/257) [30e921a](https://github.com/mgechev/codelyzer/commit/30e921a48fb98b9d929d46f905aa87d3d7e81d98).

# 3.0.0-beta.1

### Features

- Deep metadata collection with [ngast](https://github.com/mgechev/ngast) ✨ 🎆 ✨ [#217](https://github.com/mgechev/codelyzer/issues/217) [de13ceb](https://github.com/mgechev/codelyzer/commit/de13cebd0f243415fb0fe6cd67e8a8838c4a895f)
- Built-in support for template references.

### Bug Fixes

- Access to inline template objects results in "no-access-missing-member" rule being triggerred [#231](https://github.com/mgechev/codelyzer/issues/231) [d10e980](https://github.com/mgechev/codelyzer/commit/d10e9809531b6795a6ab403f87b5f68b05c8afb6)
- no-access-missing-member and async pipe [#190](https://github.com/mgechev/codelyzer/issues/190) [de13ceb](https://github.com/mgechev/codelyzer/commit/de13cebd0f243415fb0fe6cd67e8a8838c4a895f)

# 3.0.0-beta.0

### Breaking Changes

- Remove `importDestructuringSpacing`. Can be enforced with the tslint's rule [`whitespace`](https://palantir.github.io/tslint/rules/whitespace/).
- `no-access-missing-member`, `use-life-cycle-interface` and `template-use-public` require type checking which means that tslint should be run with [the corresponding options](https://github.com/palantir/tslint#type-checking)

The rules should now be run as follows:

```
$ tslint --type-check --project src/client/tsconfig.json
```

### Features

- `no-access-missing-member` support for inheritance [#191](https://github.com/mgechev/codelyzer/issues/191) [2901718](https://github.com/mgechev/codelyzer/commit/2901718d93633284be59ae04c1b00a99df7cf885)
- `use-life-cycle-interface` support for inheritance [#64](https://github.com/mgechev/codelyzer/issues/64) [d0d7138](https://github.com/mgechev/codelyzer/commit/d0d71387ab322f7bbb612c79bc673fe9dbf4880f)
- `template-use-public` support for inheritance [#240](https://github.com/mgechev/codelyzer/issues/240) [2e285e2](https://github.com/mgechev/codelyzer/commit/2e285e22efb7bdc031ded2721c52cf8e041b9901)

# 2.0.1

### Features

- Improve testing [#235](https://github.com/mgechev/codelyzer/issues/235) [77ef89e](https://github.com/mgechev/codelyzer/commit/77ef89e6a0f8d772f7e6a3e27a64e0225d2b10fd)
- Log template parsing errors on log-level debug [#227](https://github.com/mgechev/codelyzer/issues/227) [19fdabf](https://github.com/mgechev/codelyzer/commit/19fdabf90ca89161b31af445dcbba600ff249da3)
- Better error messages for `template-use-public` [#229](https://github.com/mgechev/codelyzer/issues/229) [0b7e459](https://github.com/comfroels/codelyzer/commit/0b7e459f7826995e50dab05169d528bebb58c9b4)
- Support for Angular 4.0.0-beta.8 [#241](https://github.com/mgechev/codelyzer/issues/241) [98639a9](https://github.com/mgechev/codelyzer/commit/98639a9fbf4b8b4f39d9260be69b5f5a9e5d387d)

### Bug Fixes

- Fix semantic error when declaration's generation is enabled [#221](https://github.com/mgechev/codelyzer/issues/221) [c694405](https://github.com/mgechev/codelyzer/pull/223/commits/c694405918fcc573ea05a77d465e472159031925)
- Inconsistent links to the style guide sections [#233](https://github.com/mgechev/codelyzer/issues/233) [c9e87f6](https://github.com/mgechev/codelyzer/commit/c9e87f6dccd1535745d16019880877c31373e31f)

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

