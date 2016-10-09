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

