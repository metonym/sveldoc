import { readFileSync, existsSync } from "fs";
import { sep, resolve } from "path";
import { extractComponentPath, match, parseComponent } from "./utils";

const BLANK_LINE = "<!-- BLANK -->";

interface TransformReadmeOptions {
  source: string;
  filename: string;

  /**
   * Set to `true` to omit adding markup from
   * example files outside of a code fence block.
   */
  noEval?: boolean;
}

export const transformReadme = ({
  source,
  filename,
  noEval,
}: TransformReadmeOptions) => {
  let script_module_unique_lines = new Set();
  let script_unique_lines = new Set();
  let component_paths = new Set<string>();
  let styles = "";
  let lines = source
    .split("\n")
    .map((line, index, lines) => {
      if (match.exampleStart(line)) {
        let current_index = index;
        let next_line = lines[current_index + 1];

        while (
          current_index < lines.length - 1 &&
          !match.exampleEnd(next_line)
        ) {
          current_index++;
          next_line = lines[current_index];

          if (!match.exampleEnd(next_line)) {
            lines[current_index] = BLANK_LINE;
          }
        }

        if (!next_line) return line + "\n";

        const path_component = extractComponentPath(line);
        const diagnostic = filename.split(sep).pop() + ` L${index + 1}:`;

        if (!path_component) {
          console.warn(diagnostic, "Path to example is required");
          return line;
        }

        if (!existsSync(path_component)) {
          console.warn(
            diagnostic,
            "File does not exist:",
            `"${path_component}"`
          );
          return line;
        }

        let source = readFileSync(path_component, "utf-8");
        let line_modified = line + "\n";

        component_paths.add(resolve(path_component));

        const { html, css, script, module } = parseComponent({
          source,
          filename,
        });

        module.forEach((line) => script_module_unique_lines.add(line));
        script.forEach((line) => script_unique_lines.add(line));
        styles += css;

        if (!noEval) {
          line_modified += html + "\n\n";
        }

        line_modified += "\n" + "```svelte" + "\n";
        line_modified += source;
        line_modified += "```" + "\n";

        return line_modified;
      }

      return line;
    })
    .filter((line) => line !== BLANK_LINE)
    .join("\n");

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

  return {
    code: content_script_module + content_script + content_style + code,
    dependencies,
  };
};
