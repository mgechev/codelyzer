##### Peer dependencies

The `typescript`, `tslint`, `@angular/core` and `@angular/compiler` packages are peer dependencies of codelyzer. This allows you to update the compiler independently from the linter.

Although the peer dependency allows installing the latest nightly releases of `typescript@next`, be aware that these might include breaking changes that cause the linter to malfunction.