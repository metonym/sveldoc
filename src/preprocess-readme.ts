import type { SveltePreprocessor } from "svelte/types/compiler/preprocess";
import type { DefineConfigOptions } from "./define-config";
import { processReadme } from "./process-readme";
import { match } from "./utils/match";

interface PreprocessReadmeOptions extends Pick<DefineConfigOptions, "base"> {}

export const preprocessReadme: SveltePreprocessor<
  "markup",
  PreprocessReadmeOptions
> = (options) => {
  return {
    markup: ({ content: source, filename }) => {
      if (!filename || !match.readmeFile(filename)) return;
      return processReadme({ source, filename, base: options?.base });
    },
  };
};
