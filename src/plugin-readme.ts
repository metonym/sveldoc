import fs from "fs";
import type { Plugin } from "vite";
import { processReadme } from "./process-readme";
import { match } from "./utils/match";

export const pluginReadme = (): Plugin => {
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
    async writeBundle() {
      if (!filename) return;

      const source = fs.readFileSync(filename, "utf-8");
      const transformed = await processReadme({
        source,
        filename,
        noEval: true,
      });

      fs.writeFileSync(filename, transformed.code);
    },
  };
};
