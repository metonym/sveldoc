import path from "path";
import { readdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { test, expect, describe } from "vitest";
import { Processed } from "svelte/types/compiler/preprocess";
import { pluginReadme, preprocessReadme } from "../src/integrations";

describe("pluginReadme", () => {
  test("load hook returns undefined", () => {
    const result = pluginReadme.call(this).load("./README.md");
    expect(result).toBeUndefined();
  });
});

const SNAPSHOTS = "tests/__snapshots__";
const RE_INPUT = /input.md$/;

describe("preprocessReadme", () => {
  test("preprocessor only works on README files", () => {
    const result = preprocessReadme().markup({
      content: "",
      filename: "filename.svelte",
    });

    expect(result).toBeUndefined();
  });

  test("snapshots", async () => {
    const input_files = readdirSync(SNAPSHOTS).filter((filename) => RE_INPUT.test(filename));

    for await (const filename of input_files) {
      const input_path = path.join(SNAPSHOTS, filename);
      const output_path = path.join(SNAPSHOTS, filename.replace(RE_INPUT, "output.md"));
      const result = preprocessReadme().markup({
        content: await readFile(input_path, "utf-8"),
        filename: "README.md",
      }) as Processed;

      await writeFile(output_path, result.code);
    }
  });
});
