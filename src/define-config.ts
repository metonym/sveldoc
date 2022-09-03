import { typescript } from "svelte-preprocess";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import type { UserConfig } from "vite";
import { getTsconfigPaths } from "./utils/get-tsconfig-paths";
import { pluginIndex } from "./plugin-index";
import { pluginReadme } from "./plugin-readme";
import { preprocessReadme } from "./preprocess-readme";

export interface DefineConfigOptions extends UserConfig {
  /**
   * Set to `true` to not apply default
   * GitHub Markdown styles to iframes.
   * @default false
   */
  resetStyles?: boolean;
}

type DefineConfig = (options?: DefineConfigOptions) => UserConfig & {
  test: {
    globals: boolean;
    environment?: string;
  };
};

export const defineConfig: DefineConfig = (options) => {
  const resetStyles = options?.resetStyles === true;
  const base = options?.base ?? "./";

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
        preprocess: [typescript(), preprocessReadme({ base })],
      }),
      pluginReadme(),
    ],
    test: {
      globals: true,
      environment: "jsdom",
    },
  };
};
