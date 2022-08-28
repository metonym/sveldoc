import fs from "fs";
import path from "path";
import { transformReadme } from "./transform-readme";
import { extractComponentPath, match, parseComponent } from "./utils";
import type { PluginOption } from "vite";
import type { PreprocessorGroup } from "svelte/types/compiler/preprocess";
import { marked } from "marked";

const isRelativeUrl = (url: string) => {
  if (/^(http|\/)/.test(url)) return false;
  // if (/^\//.test(url)) return false;
  return true;
};

const walkTokens = (token: any) => {
  if (token.type === "link" && isRelativeUrl(token.href)) {
    token.href = path.join("https://github.com", token.href);
  }
};

marked.use({ walkTokens });

/**
 * Svelte preprocessor that transforms
 * code blocks in your `README.md`.
 */
export const preprocessReadme = (): Pick<PreprocessorGroup, "markup"> => ({
  markup: ({ content: source, filename }) => {
    if (!filename || !match.readmeFile(filename)) return;
    return transformReadme({ source, filename });
  },
});

interface PreprocessReadmeScriptOptions {
  noEval?: boolean;
}

export const preprocessReadmeScript = (
  options?: PreprocessReadmeScriptOptions = {}
): Pick<PreprocessorGroup, "markup"> => {
  const { noEval = false } = options;
  return {
    markup: async ({ content: source, filename }) => {
      if (!filename || !match.readmeFile(filename)) return;

      let script_module_unique_lines = new Set();
      let script_unique_lines = new Set();
      let component_paths = new Set<string>();
      let styles = "";
      let lines = "";

      for await (let line of source.split("\n")) {
        if (match.exampleStart(line)) {
          const path_component = extractComponentPath(line);

          const diagnostic = filename.split(path.sep).pop();

          if (!path_component) {
            console.warn(diagnostic, "Path to example is required");
            return line;
          }

          if (!fs.existsSync(path_component)) {
            console.warn(
              diagnostic,
              "File does not exist:",
              `"${path_component}"`
            );
            return line;
          }

          let source = fs.readFileSync(path_component, "utf-8");
          let line_modified = line + "\n";

          component_paths.add(path.resolve(path_component));

          const { parsed, raw_source, plain, has_typescript } =
            await parseComponent({
              source,
              filename,
            });
          const { html, css, script, module } = parsed;

          module.forEach((line) => script_module_unique_lines.add(line));
          script.forEach((line) => script_unique_lines.add(line));
          styles += css;

          if (!noEval) {
            line_modified += html + "\n\n";
          }

          const formatted_codeblock_plain = marked.parse(`\`\`\`svelte
{@html \`${plain}\`}
\`\`\``);

          const formatted_codeblock_raw = marked.parse(`\`\`\`svelte
{@html \`${raw_source}\`}
\`\`\``);

          if (has_typescript) {
            line_modified += `
            <div on:click={() => {use_js = !use_js}}>

${formatted_codeblock_plain}

${formatted_codeblock_raw}

<div>
{#if use_js}
Bet on JS
{/if}
</div>

            </div>

          `;
          } else {
            line_modified += "\n" + "```svelte" + "\n";
            line_modified += source;
            line_modified += "```" + "\n";
          }

          lines += line_modified;
        } else {
          lines += marked.parse(line) + "\n";
        }
      }

      let content_script_module = "";
      let content_script = "";
      let content_style = "";

      if (script_module_unique_lines.size > 0) {
        content_script += '<script context="module">\n';
        content_script += [...script_module_unique_lines].join("\n") + "\n";
        content_script += "</script>\n";
      }

      if (script_unique_lines.size > 0) {
        content_script += "<script>\n";
        content_script += [...script_unique_lines].join("\n") + "\n";
        content_script += `export let pkg = {}; console.log(pkg); let use_js = new URLSearchParams(window.location.search).get('lang') === 'ts';`;
        content_script += "</script>\n";
      }

      if (styles) {
        content_style += "<style>\n";
        content_style += styles + "\n";
        content_style += "</style>\n";
      }

      let code = lines;
      let dependencies: string[] = [...component_paths];

      if (noEval) return { code, dependencies };

      code = content_script_module + content_script + content_style + code;

      // const a = marked.parse(code);

      // console.log(code)

      return {
        code,
        dependencies,
      };
      // return transformReadme({ source, filename });
    },
  };
};

/**
 * Vite plugin that transforms `README.md`
 * but omits adding Svelte stuff.
 *
 * Only executes when building the app.
 */
export const pluginReadme = (): PluginOption => {
  let filename: null | string = null;

  return {
    name: "vite:readme",
    apply: "build",
    load(id) {
      if (match.readmeFile(id)) {
        filename = id;
        return undefined;
      }
    },
    writeBundle() {
      if (filename) {
        fs.writeFileSync(
          filename,
          transformReadme({
            source: fs.readFileSync(filename, "utf-8"),
            filename,
            noEval: true,
          }).code
        );
      }
    },
  };
};
