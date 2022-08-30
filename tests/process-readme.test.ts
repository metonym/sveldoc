import { test, expect, describe } from "vitest";
import { processReadme } from "../src/process-readme";

const source = `
# heading

<!-- example-start -->
SKIP
<!-- example-end -->

<!-- example-start invalid.file -->
SKIP
<!-- example-end -->

<!-- example-start ./tests/__fixtures__/Button.svelte -->

Content


Another line

<!-- example-end -->

## heading 2

<!-- example-start tests/__fixtures__/Heading.svelte -->
<!-- example-end -->
    `;

describe("processReadme", () => {
  test("", async () => {
    const result_eval = await processReadme({ source, filename: "" });
    expect(result_eval.code).toMatchSnapshot();
    expect(result_eval.dependencies.length).toEqual(2);

    const result_no_eval = await processReadme({
      source,
      filename: "",
      noEval: true,
    });
    expect(result_no_eval.code).toMatchSnapshot();

    const result_re_eval = await processReadme({
      source: result_no_eval.code,
      filename: "",
    });
    expect(result_re_eval.code).toMatchSnapshot();
  });
});
