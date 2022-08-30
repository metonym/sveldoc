import fs from "fs";
import path from "path";
import { marked } from "marked";
import prettier from "prettier";
import "prettier-plugin-svelte";
import Prism from "prismjs";
import "prism-svelte";
import { extractComponentPath } from "./utils/extract-component-path";
import { match } from "./utils/match";
import { parseComponent } from "./utils/parse-component";
import { getPackageJson } from "./utils/get-package-json";

const package_json = getPackageJson();

marked.use({
  walkTokens: (token: any) => {
    if (
      token.type === "link" &&
      /^\.\//.test(token.href) &&
      package_json?.repository?.url
    ) {
      token.href = path.join(
        package_json.repository.url,
        "tree/master",
        token.href
      );
    }
  },
});

interface ProcessReadmeOptions {
  source: string;
  filename: string;
  noEval?: boolean;
}

export const processReadme = async (options: ProcessReadmeOptions) => {
  const { source, filename, noEval } = options;

  let cleaned = "";
  let open = false;

  source.split("\n").forEach((line, index, lines) => {
    if (!open) {
      cleaned += line + "\n";
      open = match.exampleStart(line);
    }

    if (match.exampleEnd(lines[index + 1])) open = false;
  });

  let script_module_unique_lines = new Set();
  let script_unique_lines = new Set();
  let dependencies = new Set<string>();
  let styles = "";
  let lines_code = "";

  for await (let line of cleaned.split("\n")) {
    lines_code += (noEval ? line : marked.parse(line)) + "\n";

    if (match.exampleStart(line)) {
      const path_component = extractComponentPath(line);

      if (!path_component) continue;
      if (!fs.existsSync(path_component)) continue;

      dependencies.add(path.resolve(path_component));

      const source = fs.readFileSync(path_component, "utf-8");
      const { html, css, script, module } = (
        await parseComponent({ source, filename })
      ).parsed;

      const source_formatted = prettier.format(source, { parser: "svelte" });
      const highlighted_code = Prism.highlight(
        source_formatted,
        Prism.languages.svelte,
        "svelte"
      );

      module.forEach((line) => script_module_unique_lines.add(line));
      script.forEach((line) => script_unique_lines.add(line));
      styles += css;

      let line_modified = "\n";

      if (noEval) {
        line_modified += `\`\`\`svelte\n${source_formatted}\`\`\``;
      } else {
        line_modified += `<div class="eval">\n${html}\n</div>\n`;
        line_modified += `<pre><code>{@html \`${highlighted_code}\`}</code></pre>\n\n`;
      }

      lines_code += line_modified + "\n\n";
    }
  }

  let content_script_module = `
<script context="module">
${[...script_module_unique_lines].join("\n")}
</script>\n`;
  let content_script = `<script>
${[...script_unique_lines].join("\n")}
</script>\n`;
  let content_style = `<style>\n${styles}\n</style>`;
  let code_eval = content_script_module + content_script + content_style;
  let code = noEval ? lines_code : code_eval + lines_code;

  return {
    code,
    dependencies: [...dependencies],
  };
};
