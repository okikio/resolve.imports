# resolve.imports [![CI](https://github.com/okikio/resolve.imports/workflows/CI/badge.svg)](https://github.com/okikio/resolve.imports/actions)

> A tiny (613b), correct, general-purpose, and configurable subpath `"imports"` resolver without file-system reliance. A fork of [`resolve.exports`](https://github.com/lukeed/resolve.exports), but for `imports`.

> **Warning**: Unlike `resolve.exports`, `resolve.imports` doesn't have a default entry. This means that you must be explicit about the subpath to resolve

**_Why?_**

Hopefully, this module may serve as a reference point (and/or be used directly) so that the varying tools and bundlers within the ecosystem can share a common approach with one another **as well as** with the native Node.js implementation.

With the push for ESM, we must be _very_ careful and avoid fragmentation. If we, as a community, begin propagating different _dialects_ of `"imports"` resolution, then we're headed for deep trouble. It will make supporting (and using) `"imports"` nearly impossible, which may force its abandonment and along with it, its benefits.

Let's have nice things.

**_TODO_**

- [x] imports string
- [x] imports object (single entry)
- [x] imports object (multi entry)
- [x] nested / recursive conditions
- [x] imports arrayable
- [x] directory mapping (`#foobar/` => `/foobar/`)
- [x] directory mapping (`#foobar/*` => `./other/*.js`)
- [x] directory mapping w/ conditions
- [x] directory mapping w/ nested conditions
- [ ] ~~legacy fields (`main` vs `module` vs ...)~~
- [ ] ~~legacy "browser" files object~~

## Install

```sh
$ npm install resolve.imports
```

## Usage

> Please see [`/test/`](/test) for examples.

```js
import { resolve, legacy } from "resolve.imports";

const contents = {
  name: "foobar",
  module: "dist/module.mjs",
  main: "dist/require.js",
  imports: {
    "#deps": {
      import: "./dist/module.mjs",
      require: "./dist/require.js",
    },
    "#lite": {
      worker: {
        browser: "./lite/worker.brower.js",
        node: "./lite/worker.node.js",
      },
      import: "./lite/module.mjs",
      require: "./lite/require.js",
    },
  },
};

// be explicit about the subpath to resolve, unlike `resolve.exports`
// there is no default entry
resolve(contents, "#lite"); //=> "./lite/module.mjs"

// Assume `require` usage
resolve(contents, "#deps", { require: true }); //=> "./dist/require.js"
resolve(contents, "#lite", { require: true }); //=> "./lite/require.js"

// Throws "Missing <entry> export in <name> package" Error
resolve(contents, "foobar/hello");
resolve(contents, "./hello/world");

// Add custom condition(s)
resolve(contents, "#lite", {
  conditions: ["worker"],
}); // => "./lite/worker.node.js"

// Toggle "browser" condition
resolve(contents, "#lite", {
  conditions: ["worker"],
  browser: true,
}); // => "./lite/worker.browser.js"
```

## API

### resolve(pkg, entry, options?)

Returns: `string` or `undefined`

Traverse the `"exports"` within the contents of a `package.json` file. <br>
If the contents _does not_ contain an `"exports"` map, then `undefined` will be returned.

Successful resolutions will always result in a string value. This will be the value of the resolved mapping itself – which means that the output is a relative file path.

This function may throw an Error if:

- the requested `entry` cannot be resolved (aka, not defined in the `"exports"` map)
- an `entry` _was_ resolved but no known conditions were found (see [`options.conditions`](#optionsconditions))

#### pkg

Type: `object` <br>
Required: `true`

The `package.json` contents.

#### entry

Type: `string` <br>
Required: `false` <br>
Default: `.` (aka, root)

The desired target entry, or the original `import` path.

When `entry` _is not_ a relative path (aka, does not start with `'.'`), then `entry` is given the `'./'` prefix.

When `entry` begins with the package name (determined via the `pkg.name` value), then `entry` is truncated and made relative.

When `entry` is already relative, it is accepted as is.

**_Examples_**

Assume we have a module named "foobar" and whose `pkg` contains `"name": "foobar"`.

| `entry` value        | treated as | reason                                                  |
| -------------------- | ---------- | ------------------------------------------------------- |
| `null` / `undefined` | `Error`    | be explicit about the subpath import being used         |
| `'#'`                | `'./src'`  | subpath import of `'#'`                                 |
| `'foobar'`           | `Error`    | all imports must be subpath imports starting with `'#'` |
| `'#/lite'`           | `'./lite'` | value was relative                                      |
| `'#lite'`            | `'./lite'` | value was not relative & did not have `pkg.name` prefix |

#### options.require

Type: `boolean` <br>
Default: `false`

When truthy, the `"require"` field is added to the list of allowed/known conditions.

When falsey, the `"import"` field is added to the list of allowed/known conditions instead.

#### options.browser

Type: `boolean` <br>
Default: `false`

When truthy, the `"browser"` field is added to the list of allowed/known conditions.

#### options.conditions

Type: `string[]` <br>
Default: `[]`

Provide a list of additional/custom conditions that should be accepted when seen.

> **Important:** The order specified within `options.conditions` does not matter. <br>The matching order/priority is **always** determined by the `"imports"` map's key order.

For example, you may choose to accept a `"production"` condition in certain environments. Given the following `pkg` content:

```js
const contents = {
  // ...
  imports: {
    "#dep": {
      worker: "./index.worker.js",
      require: "./index.require.js",
      production: "./index.prod.js",
      import: "./index.import.mjs",
    }
  },
};

resolve(contents, "#dep");
//=> "./index.import.mjs"

resolve(contents, "#dep", {
  conditions: ["production"],
}); //=> "./index.prod.js"

resolve(contents, "#dep", {
  conditions: ["production"],
  require: true,
}); //=> "./index.require.js"

resolve(contents, "#dep", {
  conditions: ["production", "worker"],
  require: true,
}); //=> "./index.worker.js"

resolve(contents, "#dep", {
  conditions: ["production", "worker"],
}); //=> "./index.worker.js"
```

#### options.unsafe

Type: `boolean` <br>
Default: `false`

> **Important:** You probably do not want this option! <br>It will break out of Node's default resolution conditions.

When enabled, this option will ignore **all other options** except [`options.conditions`](#optionsconditions). This is because, when enabled, `options.unsafe` **does not** assume or provide any default conditions except the `"default"` condition.

```js
resolve(contents, "#dep");
//=> Conditions: ["default", "import", "node"]

resolve(contents, "#dep", { unsafe: true });
//=> Conditions: ["default"]

resolve(contents, "#dep", { unsafe: true, require: true, browser: true });
//=> Conditions: ["default"]
```

In other words, this means that trying to use `options.require` or `options.browser` alongside `options.unsafe` will have no effect. In order to enable these conditions, you must provide them manually into the `options.conditions` list:

```js
resolve(contents, "#dep", {
  unsafe: true,
  conditions: ["require"],
});
//=> Conditions: ["default", "require"]

resolve(contents, "#dep", {
  unsafe: true,
  conditions: ["browser", "require", "custom123"],
});
//=> Conditions: ["default", "browser", "require", "custom123"]
```

## License

MIT © [Okiki Ojo](https://okikio.dev)
