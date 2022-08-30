import type { PreprocessorGroup } from "svelte/types/compiler/preprocess";
import { processReadme } from "./process-readme";
import { match } from "./utils/match";

export const preprocessReadme = (): Pick<PreprocessorGroup, "markup"> => {
  return {
    markup: ({ content: source, filename }) => {
      if (!filename || !match.readmeFile(filename)) return;
      return processReadme({ source, filename });
    },
  };
};
