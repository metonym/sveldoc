import path from "path";
import { preprocessReadme, pluginReadme } from "./integrations";
import { mdsvex } from "mdsvex";
import preprocess from "svelte-preprocess";
import type { MdsvexOptions } from "mdsvex";
import type { Config as SvelteKitConfig, Adapter } from "@sveltejs/kit";
import type { AliasOptions, UserConfig as ViteConfig } from "vite";

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
  mdsvexOptions?: MdsvexOptions;

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

/**
 * Creates a `svelte.config.js` object with
 * `svelte-preprocess`, `readme`, and `mdsvex` preprocessors.
 *
 * `svelte-preprocess` be installed as development dependency.
 */
export const createConfig: (config: CreateConfigOptions) => Promise<SvelteKitConfig> = async (
  config
) => {
  const vite =
    typeof config?.kit?.vite === "function"
      ? ((await config.kit.vite()) as ViteConfig)
      : config?.kit?.vite;
  const alias: AliasOptions = {};
  const files = config?.files ?? config?.kit?.files;

  if (config?.name) {
    alias[config?.name] = path.resolve(files?.lib ?? "src/lib");
  }

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
      adapter: config?.adapter,
      files: config?.files,
      prerender: {
        default: true,
      },
      ...config?.kit,
      vite: {
        ...vite,
        plugins: [...(vite?.plugins ?? []), pluginReadme()],
        resolve: {
          ...vite?.resolve,
          alias: {
            ...alias,
            ...vite?.resolve?.alias,
          },
        },
        server: {
          ...vite?.server,
          watch: {
            ignored: ["!README.md"],
            ...vite?.server?.watch,
          },
          fs: {
            allow: [".."],
            ...vite?.server?.fs,
          },
        },
      },
    },
  };
};
