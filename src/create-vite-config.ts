import fs from "fs";
import path from "path";
import { typescript } from "svelte-preprocess";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import type { UserConfig, Plugin } from "vite";
import { preprocessReadmeScript } from "./integrations";

const meta = (): Plugin => {
  return {
    name: "vite:meta",
    transformIndexHtml(html) {
      // TODO: apply only if index.html only contains a script
      return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body>
            ${html}
          </body>
        </html>
      `;
    },
  };
};

interface TsconfigWithPaths {
  compilerOptions?: {
    paths?: Record<string, [path: string]>;
  };
}

const getTsconfig = (): TsconfigWithPaths => {
  let tsconfig: TsconfigWithPaths = {};

  try {
    const tsconfig_path = path.join(process.cwd(), "tsconfig.json");
    const tsconfig_json = fs.readFileSync(tsconfig_path, "utf-8");
    tsconfig = JSON.parse(tsconfig_json) ?? {};
  } catch (e) {
  } finally {
    return tsconfig;
  }
};

interface CreateViteConfigOptions extends UserConfig {}

export const createViteConfig = (
  options?: CreateViteConfigOptions
): UserConfig => {
  const viteOptions: UserConfig = {
    ...options,
    resolve: {
      ...options?.resolve,
      alias: {
        ...options?.resolve?.alias,
      },
    },
  };

  const tsconfig = getTsconfig();

  if (tsconfig.compilerOptions?.paths) {
    const alias = Object.entries(tsconfig.compilerOptions.paths).reduce(
      (paths, [key, item]) => {
        return {
          ...paths,
          [key]: path.resolve(item[0]),
        };
      },
      {}
    );

    viteOptions.resolve!.alias = {
      ...viteOptions.resolve?.alias,
      ...alias,
    };
  }

  return {
    ...viteOptions,
    plugins: [
      meta(),
      svelte({
        extensions: [".svelte", ".md"],
        preprocess: [typescript(), preprocessReadmeScript()],
      }),
    ],
    // TODO: type test options used by vitest.config.js
    // @ts-ignore
    test: {
      globals: true,
      environment: "jsdom",
    },
  };
};
