import { typescript } from "svelte-preprocess";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import type { UserConfig } from "vite";
import { getTsconfigPaths } from "./utils/get-tsconfig-paths";
import { pluginIndex } from "./plugin-index";
import { pluginReadme } from "./plugin-readme";
import { preprocessReadme } from "./preprocess-readme";

export interface CreateViteConfigOptions extends UserConfig {
  /**
   * Set to `true` to not apply default
   * GitHub Markdown styles to iframes.
   * @default false
   */
  resetStyles?: boolean;
}

type CreateViteConfig = (options?: CreateViteConfigOptions) => UserConfig & {
  test: {
    globals: boolean;
    environment?: string;
  };
};

export const createViteConfig: CreateViteConfig = (options) => {
  const resetStyles = options?.resetStyles === true;

  return {
    ...options,
    resolve: {
      ...options?.resolve,
      alias: {
        ...options?.resolve?.alias,
        ...getTsconfigPaths(),
      },
    },
    plugins: [
      pluginIndex({
        resetStyles,
      }),
      svelte({
        extensions: [".svelte", ".md"],
        preprocess: [
          typescript(),
          preprocessReadme({
            base: options?.base ?? ".",
          }),
        ],
      }),
      pluginReadme(),
    ],
    test: {
      globals: true,
      environment: "jsdom",
    },
  };
};
