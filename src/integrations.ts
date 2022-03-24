import { readFileSync, writeFileSync } from "fs";
import { transformReadme } from "./transform-readme";
import { match } from "./utils";
import type { PluginOption } from "vite";
import type { PreprocessorGroup } from "svelte/types/compiler/preprocess";

/**
 * Svelte preprocessor that transforms
 * content in a `README.md` file.
 */
export const preprocessReadme: () => Pick<PreprocessorGroup, "markup"> = () => ({
  markup: ({ content: source, filename }) => {
    if (!filename || !match.readmeFile(filename)) return;
    return transformReadme({ source, filename });
  },
});

/**
 * Vite plugin that transforms the `README.md`
 * but omits adding Svelte stuff.
 *
 * Only executes when building the app.
 */
export const pluginReadme: () => PluginOption = () => {
  let filename: null | string = null;

  return {
    name: "vite-plugin-readme",
    apply: "build",
    load(id) {
      if (match.readmeFile(id)) {
        filename = id;
        return undefined;
      }
    },
    writeBundle() {
      if (filename)
        writeFileSync(
          filename,
          transformReadme({
            source: readFileSync(filename, "utf-8"),
            filename,
            noEval: true,
          }).code
        );
    },
  };
};
