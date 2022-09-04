import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import prettier from "prettier";
import type { Plugin } from "vite";
import { fdir } from "fdir";
import type { PathsOutput } from "fdir";
import typescript from "typescript";
import { processReadme } from "./process-readme";
import { match } from "./utils/match";
import { parseApi } from "./parse-api";

export const pluginReadme = (): Plugin => {
  let filename: null | string = null;

  return {
    name: "vite:readme",
    apply: "build",
    buildStart() {
      fs.rmSync("dist", { recursive: true, force: true });
      fs.mkdirSync("dist");
    },
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
    async load(id) {
      if (match.readmeFile(id)) {
        filename = id;
        return undefined;
      }

      const { dir, ext, name } = path.parse(id);

      if (dir.endsWith("/src")) {
        if (ext === ".svelte") {
          const source = await fsp.readFile(id, "utf-8");
          const api = await parseApi({ source, filename: id });
          // TODO: generate TS def for Svelte component
        } else if (ext === ".ts") {
          const compilerOptions = {
            module: typescript.ModuleKind.ESNext,
            target: typescript.ScriptTarget.ESNext,
            declaration: true,
            emitDeclarationOnly: true,
            outDir: "dist",
          };
          const host = typescript.createCompilerHost(compilerOptions);
          const program = typescript.createProgram([id], compilerOptions, host);
          program.emit();

          const source = await fsp.readFile(id, "utf-8");
          const result = typescript.transpileModule(source, {
            compilerOptions,
          });
          const output_path = path.resolve(process.cwd(), "dist", name + ".js");

          fsp.writeFile(
            output_path,
            prettier.format(result.outputText, { parser: "babel" })
          );
        }
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
