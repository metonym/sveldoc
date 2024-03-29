import { parse } from "svelte/compiler";

interface ParseComponentOptions {
  source: string;
  filename: string;
}
interface ParsedComponent {
  html: string;
  css: string;
  script: string[];
  module: string[];
}

// TODO: allow examples to use TypeScript
export const parseComponent = async ({
  source: raw_source,
  filename,
}: ParseComponentOptions) => {
  let source = raw_source;

  const { html, css, instance, module } = parse(source, { filename });
  const fragment = (start: number, end: number) => source.slice(start, end);
  const split = (fragment: string) =>
    fragment
      .split(";")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line + ";");

  const parsed: ParsedComponent = {
    html: fragment(html.start, html.end),
    css: css?.content.styles ?? "",
    script: [],
    module: [],
  };

  if (module) {
    parsed.html = parsed.html.replace(fragment(module.start, module.end), "");
    parsed.module = split(fragment(module.content.start, module.content.end));
  }

  if (instance) {
    parsed.html = parsed.html.replace(
      source.slice(instance.start, instance.end),
      ""
    );
    parsed.script = split(
      fragment(instance.content.start, instance.content.end)
    );
  }

  return {
    parsed,
  };
};
