import { typescript } from "svelte-preprocess";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import type { UserConfig } from "vite";
import { getTsconfigPaths } from "./utils/get-tsconfig-paths";
import { pluginIndex } from "./plugin-index";
import { pluginReadme } from "./plugin-readme";
import { preprocessReadme } from "./preprocess-readme";

type CreateViteConfig = (options?: UserConfig) => UserConfig & {
  test: {
    globals: boolean;
    environment?: string;
  };
};

export const createViteConfig: CreateViteConfig = (options) => {
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
      pluginIndex(),
      svelte({
        extensions: [".svelte", ".md"],
        preprocess: [typescript(), preprocessReadme()],
      }),
      pluginReadme(),
    ],
    test: {
      globals: true,
      environment: "jsdom",
    },
    optimizeDeps: {
      exclude: ["prism-svelte"],
    },
  };
};
