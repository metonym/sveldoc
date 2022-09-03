import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import prettier from "prettier";
import "prettier-plugin-svelte";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prism-svelte";
import { extractComponentPath } from "./utils/extract-component-path";
import { extractComponentOptions } from "./utils/extract-component-options";
import { match } from "./utils/match";
import { parseComponent } from "./utils/parse-component";
import { getPackageJson } from "./utils/get-package-json";

const package_json = getPackageJson();

marked.use({
  highlight: (code, lang) => {
    let highlighted = code;
    try {
      highlighted = Prism.highlight(highlighted, Prism.languages[lang], lang);
    } catch (e) {
    } finally {
      return highlighted;
    }
  },
  walkTokens: (token: any) => {
    if (
      token.type === "link" &&
      /^\.\//.test(token.href) &&
      package_json?.repository?.url
    ) {
      token.href = path.join(
        package_json.repository.url,
        "tree",
        // TODO: configure default branch name
        "master",
        token.href
      );
    }
  },
});

interface ProcessReadmeOptions {
  source: string;
  filename: string;
  noEval?: boolean;
  base?: string;
}

export const processReadme = async (options: ProcessReadmeOptions) => {
  const { source, filename, noEval } = options;
  const base_url = options?.base ?? "/";

  let cleaned = "";
  let open = false;

  source.split("\n").forEach((line, index, lines) => {
    if (!open) {
      cleaned += line + "\n";
      open = match.exampleStart(line);
    }

    if (match.exampleEnd(lines[index + 1])) open = false;
  });

  if (!noEval) {
    cleaned = marked.parse(cleaned);
  }

  let script_module_unique_lines = new Set();
  let script_unique_lines = new Set();
  let dependencies = new Set<string>();
  let styles = "";
  let lines_code = "";

  for await (let line of cleaned.split("\n")) {
    lines_code += line + "\n";

    if (match.exampleStart(line)) {
      const path_component = extractComponentPath(line);
      const path_options = extractComponentOptions(line);

      if (!path_component) continue;
      if (!fs.existsSync(path_component)) continue;

      dependencies.add(path.resolve(path_component));

      // Create corresponding `.html` file for component
      const { base, name } = path.parse(path_component);
      const template = `
        <script type="module">
          import Component from "./${base}";
        
          new Component({ target: document.body });
        </script>
      `;
      const path_html = path.resolve(path_component + ".html");

      if (!fs.existsSync(path_html)) {
        fs.writeFileSync(path_html, template);
      }

      const source = fs.readFileSync(path_component, "utf-8");
      const { html, css, script, module } = (
        await parseComponent({ source, filename })
      ).parsed;

      let source_modified = source;

      if (path_options.blocks !== null) {
        source_modified = "";

        if (path_options.blocks.includes("markup")) {
          source_modified += html;
        }

        if (path_options.blocks.includes("style")) {
          source_modified += `<style>\n${css}\n</style>`;
        }
      }

      const source_formatted = prettier.format(source_modified, {
        parser: "svelte",
      });
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
        if (!path_options.no_eval) {
          line_modified += `
            <iframe
              title="${name} example"
              src="${base_url}examples/${base}.html"
              loading="lazy"
              ${
                path_options.height
                  ? `style='height: ${path_options.height}'`
                  : ""
              }
            />`;
        }
        line_modified += `<pre><code>{@html \`${highlighted_code}\`}</code></pre>\n\n`;
      }

      lines_code += line_modified + "\n\n";
    }
  }

  return {
    code: lines_code,
    dependencies: [...dependencies],
  };
};
