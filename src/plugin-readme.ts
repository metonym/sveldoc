import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";
import type { Plugin } from "vite";
import { fdir } from "fdir";
import type { PathsOutput } from "fdir";
import { processReadme } from "./process-readme";
import { match } from "./utils/match";

export const pluginReadme = (): Plugin => {
  let filename: null | string = null;

  return {
    name: "vite:readme",
    apply: "build",
    config(config) {
      const files = (
        new fdir()
          .withFullPaths()
          .crawl(path.resolve(process.cwd(), "examples"))
          .sync() as PathsOutput
      ).filter((path) => /\.svelte.html$/.test(path));

      if (config.build?.rollupOptions === undefined) {
        config.build!.rollupOptions = {
          input: {},
        };
      }

      config.build!.rollupOptions!.input = {
        main: path.resolve(process.cwd(), "index.html"),
        ...files.reduce(
          (files, file) => ({
            ...files,
            [path.parse(file).name]: file,
          }),
          {}
        ),
      };
    },
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

      fs.writeFileSync(
        filename,
        prettier.format(transformed.code, { parser: "markdown" })
      );
    },
  };
};
