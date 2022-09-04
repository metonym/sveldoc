import type { Action } from "svelte/action";

type CounterAction = Action<HTMLInputElement | HTMLTextAreaElement>;

export const counter: CounterAction = (element) => {
  const keydown = (e: KeyboardEvent) => {};

  document.body.addEventListener("keydown", keydown);

  return {
    update(options) {
      element.selectionStart = element.selectionEnd;
    },
    destroy() {
      document.body.removeEventListener("keydown", keydown);
    },
  };
};
