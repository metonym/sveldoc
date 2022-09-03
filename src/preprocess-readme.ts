import type { SveltePreprocessor } from "svelte/types/compiler/preprocess";
import { processReadme } from "./process-readme";
import { match } from "./utils/match";

export const preprocessReadme: SveltePreprocessor<"markup"> = () => {
  return {
    markup: ({ content: source, filename }) => {
      if (!filename || !match.readmeFile(filename)) return;
      return processReadme({ source, filename });
    },
  };
};
