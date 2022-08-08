import path from "path";
import { mdsvex } from "mdsvex";
import preprocess from "svelte-preprocess";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import type { MdsvexOptions } from "mdsvex";
import type { Config as SvelteKitConfig } from "@sveltejs/kit";
import type { AliasOptions, UserConfig } from "vite";
import { preprocessReadme, pluginReadme } from "./integrations";

interface CreateConfigOptions extends SvelteKitConfig {
  /**
   * Options passed to `mdsvex`.
   * @default
   * {
   *   extensions: [".md"],
   *   smartypants: false
   * }
   */
  mdsvexOptions?: MdsvexOptions;
}

/**
 * Creates a `svelte.config.js` object with `svelte-preprocess`, `readme`, and `mdsvex` preprocessors.
 *
 * `svelte-preprocess` should be installed as development dependency.
 */
export const createConfig: (config: CreateConfigOptions) => SvelteKitConfig = (config) => {
  return {
    extensions: [".svelte", ".md"],
    preprocess: [
      preprocess(),
      preprocessReadme(),
      mdsvex({
        extensions: [".md"],
        smartypants: false,
        ...config?.mdsvexOptions,
      }),
    ],
    kit: {
      prerender: { default: true },
      ...config?.kit,
    },
  };
};

interface CreateViteConfigOptions extends ReturnType<typeof createConfig>, UserConfig {
  /**
   * Specify the package name.
   *
   * The default resolution path is assumed to be `src/lib`.
   * Override it using `kit.files.lib`.
   * @example "package-name"
   */
  name?: string;
}

export const createViteConfig = (
  config: ReturnType<typeof createConfig>,
  viteConfig: CreateViteConfigOptions
): UserConfig => {
  const TEST = process.env.VITEST;

  const alias: AliasOptions = {};
  const files = config?.kit?.files;

  // TODO: infer package name from package.json#name or tsconfig.json#compilerOptions.paths
  if (viteConfig?.name) {
    alias[viteConfig?.name] = path.resolve(files?.lib ?? "src/lib");
  }

  return {
    plugins: TEST ? [svelte({ hot: false })] : [...(viteConfig?.plugins ?? []), pluginReadme()],
    resolve: {
      ...viteConfig?.resolve,
      alias: {
        ...alias,
        ...viteConfig?.resolve?.alias,
      },
    },
    server: {
      ...viteConfig?.server,
      watch: {
        ignored: ["!README.md"],
        ...viteConfig?.server?.watch,
      },
      fs: {
        allow: [".."],
        ...viteConfig?.server?.fs,
      },
    },

    // TODO: type test options used by vitest.config.js
    // @ts-ignore
    test: {
      globals: true,
      environment: "jsdom",
    },
  };
};
