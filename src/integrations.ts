import fs from "fs";
import { transformReadme } from "./transform-readme";
import { match } from "./utils";
import type { PluginOption } from "vite";
import type { PreprocessorGroup } from "svelte/types/compiler/preprocess";

/**
 * Svelte preprocessor that transforms
 * code blocks in your `README.md`.
 */
export const preprocessReadme = (): Pick<PreprocessorGroup, "markup"> => ({
  markup: ({ content: source, filename }) => {
    if (!filename || !match.readmeFile(filename)) return;
    return transformReadme({ source, filename });
  },
});

/**
 * Vite plugin that transforms `README.md`
 * but omits adding Svelte stuff.
 *
 * Only executes when building the app.
 */
export const pluginReadme = (): PluginOption => {
  let filename: null | string = null;

  return {
    name: "vite:readme",
    apply: "build",
    load(id) {
      if (match.readmeFile(id)) {
        filename = id;
        return undefined;
      }
    },
    writeBundle() {
      if (filename) {
        fs.writeFileSync(
          filename,
          transformReadme({
            source: fs.readFileSync(filename, "utf-8"),
            filename,
            noEval: true,
          }).code
        );
      }
    },
  };
};
