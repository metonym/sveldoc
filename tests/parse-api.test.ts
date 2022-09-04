import { it, expect, describe } from "vitest";
import { parseApi } from "../src/parse-api";

const source = `
  <script context="module" lang="ts">
    type Get = () => void;

    export const get: Get = () => {};
  </script>
  <script lang="ts">
    import Component from "./Component.svelte";
    import ComponentDefault2, { C2 } from "./Component.svelte";
    import { ComponentNamed, ComponentNamed2 } from "./Component.svelte";
    import { Component as ComponentAlias } from "./Component.svelte";
    import type { MyType } from "./Component";

    /** This is a comment */
    export let prop_optional = '0';

    type Optional2 = number;
    export let prop_optional_2: Optional2 = 0;

    /**
     * This is a multiline comment.
     */
    export let prop_required;

    export let prop_union_type: number | Optional2 = 0;

    export let prop_fn = (text) => false;

    export const prop_const = null;

    export const accessor = () => {};

    export function accessor2(a, b) {
      return a + b;
    }

    interface $$Events {
  
    }
    
    interface $$Slots {
     /** this is a comment */
     a: {
      /** this is another comment */
      value: number;
     } 

     "b-2": {
      /** this is another comment for this prop */
      value: null | MyType;

      /** @see */
      "value-2": any;
     };

     default: {
       fn: (name?: string) => void;
     }
    }

    interface Option3 {}

    const dispatch = createEventDispatcher<{
      clicked: Option2;
      /** This is a comment. */
      "event-2": number | Option3;
      event3: number;
    }>();
  </script>

  <div {...$$restProps} on:click></div>

  <Component {...$$restProps} on:click />

  <style></style>
    `;

describe("parseApi", () => {
  it("parses the component API correctly", async () => {
    const result = await parseApi({ source, filename: "./App.svelte" });
    expect(result.props).toMatchSnapshot();
    expect(result.events).toMatchSnapshot();
    expect(result.slots).toMatchSnapshot();
    expect(result.code).toMatchSnapshot();
    expect(result.referenced_type_aliases).toMatchInlineSnapshot(`
      [
        {
          "kind": "type declaration",
          "raw": "type Optional2 = number;",
          "type": "number",
        },
        {
          "kind": "type interface",
          "raw": "interface Option3 {}",
        },
        {
          "kind": "type import",
          "raw": "import type { MyType } from \\"./Component\\";",
        },
      ]
    `);
  });
});
