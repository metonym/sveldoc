# sveldoc

> Readme-driven Development for SvelteKit.

## Installation

```bash
pnpm i -D sveldoc
```

## Recommended Set-up

The easiest way to get started is to use `createConfig` to create a base `svelte.config.js`.

### `createConfig`

```js
// svelte.config.js
import adapter from "@sveltejs/adapter-static";
import { createConfig } from "sveldoc";

export default createConfig({
  kit: {
    adapter: adapter(),
    files: {
      lib: "src",
      routes: "demo",
      template: "demo/_app.html",
    },
  },
});
```

### `createViteConfig`

```js
// vite.config.js
import { sveltekit } from "@sveltejs/kit/vite";
import { createViteConfig } from "sveldoc";
import svelteConfig from "./svelte.config.js";

export default createViteConfig(svelteConfig, {
  name: "<package-name>",
  plugins: [sveltekit()],
});
```

### TypeScript

#### `tsconfig.json`

If using `vite.resolve.alias` to alias the package name in `svelte.config.js`, you must also include it in `tsconfig.json`.

```diff
{
  "compilerOptions: {
     "paths": {
+      "<package-name>": ["src"]
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
