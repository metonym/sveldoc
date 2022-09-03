import { test, expect, describe, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import type { SvelteComponent } from "svelte";
import Basic from "@examples/Basic.svelte";

describe("Counter", () => {
  let instance: null | SvelteComponent = null;

  afterEach(() => {
    instance?.$destroy();
    instance = null;
    document.body.innerHTML = "";
  });

  test("Basic", async () => {
    const target = document.body;

    instance = new Basic({ target });

    const button = target.querySelector("button")!;
    expect(button.innerHTML).toEqual("Increment the count: 10");

    await userEvent.click(button);
    expect(button.innerHTML).toEqual("Increment the count: 11");
  });
});
