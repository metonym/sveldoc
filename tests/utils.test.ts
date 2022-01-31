import { test, expect, describe } from "vitest";
import { parseComponent, match, extractComponentPath } from "../src/utils";

describe("utils", () => {
  test("parseComponent", () => {
    expect(parseComponent({ source: "", filename: "" })).toMatchInlineSnapshot(
      `
      {
        "css": "",
        "html": "",
        "module": [],
        "script": [],
      }
    `
    );

    expect(
      parseComponent({
        source: `
<script context="module">
  export const name = 'world'
</script>

<script>
  export let id;import Component from "./component";
</script>

<h1><slot /></h1>

<style>h1{color:red}</style>
      `,
        filename: "",
      })
    ).toMatchInlineSnapshot(`
      {
        "css": "h1{color:red}",
        "html": "
      
      
      
      <h1><slot /></h1>",
        "module": [
          "export const name = 'world';",
        ],
        "script": [
          "export let id;",
          "import Component from \\"./component\\";",
        ],
      }
    `);
  });

  test("match README file", () => {
    expect(match.readmeFile("")).toEqual(false);
    expect(match.readmeFile("changelog.md")).toEqual(false);
    expect(match.readmeFile("README.md")).toEqual(true);
    expect(match.readmeFile("readme.md")).toEqual(true);
  });

  test("match example start", () => {
    expect(match.exampleStart("")).toEqual(false);
    expect(match.exampleStart("<!-- example-start")).toEqual(true);
    expect(match.exampleStart("<!-- example-start -->")).toEqual(true);
  });

  test("match example end", () => {
    expect(match.exampleEnd("")).toEqual(false);
    expect(match.exampleEnd("<!-- example-end")).toEqual(false);
    expect(match.exampleEnd("<!-- example-end -->")).toEqual(true);
  });

  test("extractComponentPath", () => {
    expect(extractComponentPath("<!-- example-start -->")).toBeUndefined();
    expect(extractComponentPath("")).toMatchInlineSnapshot('""');
    expect(
      extractComponentPath("<!-- example-start src/Component.svelte -->")
    ).toMatchInlineSnapshot('"src/Component.svelte"');
  });
});
