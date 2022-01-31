# sveldoc

> Readme-driven Development for SvelteKit.

## Installation

```bash
pnpm i -D sveldoc
```

## Recommended Set-up

The easiest way to get started is to use `createConfig` to create a base `svelte.config.js`.

### `createConfig`

Using `createConfig` requires `mdsvex` and `svelte-preprocess` to be installed.

```bash
pnpm i -D mdsvex svelte-preprocess
```

**Minimal**

Specify the package name for `name`.

`sveldoc` will alias the name to the kit `lib` folder.

By default, components are expected to be located in `src/lib`.

```js
// svelte.config.js
import adapter from "@sveltejs/adapter-static";
import { createConfig } from "sveldoc";

export default createConfig({
  name: "svelte-focus-key",
  adapter: adapter(),
});
```

**Custom file structure**

```js
// svelte.config.js
import adapter from "@sveltejs/adapter-static";
import { createConfig } from "sveldoc";

export default createConfig({
  name: "svelte-focus-key",
  adapter: adapter(),
  files: {
    lib: "src",
    routes: "demo",
    template: "demo/_app.html",
  },
});
```

**`createConfig` signature**

`createConfig` extends the base SvelteKit `Config` interface.

```ts
interface CreateConfigOptions extends SvelteKitConfig {
  /**
   * Specify the package name.
   *
   * The default resolution path is assumed to be `src/lib`;
   * override it using `files.lib` or `kit.files.lib`.
   * @example "package-name"
   */
  name?: string;

  /**
   * Options passed to `mdsvex`.
   * @default
   * {
   *   extensions: [".md"],
   *   smartypants: false
   * }
   */
  mdsvexOptions?: Record<string, any>;

  /**
   * Specify the SvelteKit adapter.
   * @example
   * import adapter from "@sveltejs/adapter-static";
   *
   * createConfig({
   *   adapter: adapter()
   * });
   */
  adapter?: Adapter;

  files?: {
    /**
     * @example "src"
     */
    lib?: string;

    /**
     * @example "demo"
     */
    routes?: string;

    /**
     * @example "demo/_app.html"
     */
    template?: string;

    serviceWorker?: string;
    assets?: string;
    hooks?: string;
  };
}
```

### TypeScript

#### `tsconfig.json`

If using `vite.resolve.alias` to alias the package name in `svelte.config.js`, you must also include it in `tsconfig.json`.

```diff
{
  "compilerOptions: {
     "paths": {
+      "package-name": ["src/lib"]
     }
  }
}

```

#### `global.d.ts`

You may experience a type error when importing the `README` file:

```ts
import App from "../../README.md"; // Cannot find module or its corresponding type declarations.
```

Use [module declaration](https://www.typescriptlang.org/docs/handbook/modules.html) to associate markdown files as Svelte components.

Add the following to **global.d.ts**:

```ts
// global.d.ts
/// <reference types="@sveltejs/kit" />

declare module "*.md" {
  export { SvelteComponent as default } from "svelte";
}
```

## Changelog

[CHANGELOG.md](CHANGELOG.md)

## License

[MIT](LICENSE)
