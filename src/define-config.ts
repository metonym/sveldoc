import { typescript } from "svelte-preprocess";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import type { UserConfig } from "vite";
import { getTsconfigPaths } from "./utils/get-tsconfig-paths";
import { pluginIndex } from "./plugin-index";
import { pluginReadme } from "./plugin-readme";
import { preprocessReadme } from "./preprocess-readme";

export interface DefineConfigOptions extends UserConfig {
  /**
   * Specify additional CSS styles to be
   * injected into the main index file.
   */
  styles?: string;

  /**
   * Set to `true` to not apply default
   * GitHub Markdown styles to iframes.
   * @default false
   */
  resetStyles?: boolean;

  /**
   * Specify the default branch used to
   * permalink relative URLs in the README.
   * @default "master"
   */
  branch?: string;
}

type DefineConfig = (options?: DefineConfigOptions) => UserConfig & {
  test: {
    globals: boolean;
    environment?: string;
  };
};

export const defineConfig: DefineConfig = (options) => {
  const resetStyles = options?.resetStyles === true;
  const base = options?.base;
  const branch = options?.branch;

  return {
    ...options,
    base,
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
        preprocess: [typescript(), preprocessReadme({ base, branch })],
      }),
      pluginReadme(),
    ],
    test: {
      globals: true,
      environment: "jsdom",
    },
  };
};
