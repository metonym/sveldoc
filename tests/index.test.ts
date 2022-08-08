import { test, expect, describe } from "vitest";
import * as imports from "../src";

describe("index.ts", () => {
  test("API", () => {
    expect(Object.keys(imports)).toMatchInlineSnapshot(`
      [
        "createConfig",
        "createViteConfig",
        "readme",
        "sveldoc",
      ]
    `);
  });
});
