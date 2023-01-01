## [1.1.1](https://github.com/okikio/resolve.imports/compare/v1.1.0...v1.1.1) (2023-01-01)


### Bug Fixes

* forgot to make pkg public ([3fa0663](https://github.com/okikio/resolve.imports/commit/3fa06639d40fbf3c7393d5b1085acc6b51732716))

# [1.1.0](https://github.com/okikio/resolve.imports/compare/v1.0.0...v1.1.0) (2023-01-01)


### Features

* fork resolve.exports into resolve.imports for resolving subpath imports ([bd505cd](https://github.com/okikio/resolve.imports/commit/bd505cdd8258010a0f6243b56e402cd6424364d8))

# 1.0.0 (2023-01-01)


### Bug Fixes

* allow conditions in directory mapping ([#2](https://github.com/okikio/resolve.imports/issues/2)) ([a881ef8](https://github.com/okikio/resolve.imports/commit/a881ef8f02c49e9c8ae25a144060e4b1a6255d5c)), closes [#1](https://github.com/okikio/resolve.imports/issues/1)
* check subpattern length correctly; ([81ae07a](https://github.com/okikio/resolve.imports/commit/81ae07abe2b949b0f789fe4a6a242dae822cde9f)), closes [#4](https://github.com/okikio/resolve.imports/issues/4)
* consolidate `Set` initializer ([9daed2a](https://github.com/okikio/resolve.imports/commit/9daed2a30a6d88c5cdecfe25814d00d664857d3f))
* ignore "import" condition when `requires` enabled ([dcff185](https://github.com/okikio/resolve.imports/commit/dcff185faa83ace17aba927026319c1d8481705c))
* tests ([567fde6](https://github.com/okikio/resolve.imports/commit/567fde6a27b190dade14fdd90def577c8b4a6d8f))
* tests ([758b7b5](https://github.com/okikio/resolve.imports/commit/758b7b5f955f27a1877a09283feacac2aad01272))
* throw "no conditions" error ([0fe321b](https://github.com/okikio/resolve.imports/commit/0fe321bfcbdec7769d373c4456c9cb2dc124ead9))


### Features

* add `legacy` method for non-exports fields ([ce7ca85](https://github.com/okikio/resolve.imports/commit/ce7ca85d961f7dc65334e6493b71af113e670286))
* add `unsafe` option ([#13](https://github.com/okikio/resolve.imports/issues/13)) ([0b69d12](https://github.com/okikio/resolve.imports/commit/0b69d12a22d68a7588129b154f39490cd5514088))
* directory/subpath mapping; ([9e66106](https://github.com/okikio/resolve.imports/commit/9e6610676eb1c79753f867c07b258ffa3549901e))
* handle "browser" files object ([a1374ea](https://github.com/okikio/resolve.imports/commit/a1374ea2966e8db4c8fc4ab39f4f34bce4beffd1))
* support mixed path/conditions (array) ([f74e3c5](https://github.com/okikio/resolve.imports/commit/f74e3c549e7b248f728a5e316b84a5eccf28996e))
* **types:** allow `readonly` and `const` arrays in options ([#15](https://github.com/okikio/resolve.imports/issues/15)) ([587b0ba](https://github.com/okikio/resolve.imports/commit/587b0ba1adcbef257a108b7c8edb12ce0cb1bfb2))
