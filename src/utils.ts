import { typescript } from "svelte-preprocess";
import { parse, preprocess } from "svelte/compiler";

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

export const parseComponent = async ({
  source: raw_source,
  filename,
}: ParseComponentOptions) => {
  let source = raw_source;
  let plain = source;
  
  // TODO: find a better way to determine if file uses TS
  let has_typescript = /lang="ts"/.test(source);
  if (has_typescript) {
    const result = await preprocess(source, [typescript()], { filename });
    source = result.code;
    plain = result.code.replace(/ lang="ts"/, "");
  }
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

  return { parsed, raw_source, plain, has_typescript };
};

export const match: Record<string, (str: string) => boolean> = {
  readmeFile: (filename) => /readme.md$/i.test(filename),
  exampleStart: (line) => /^<!-- example-start/.test(line),
  exampleEnd: (line) => /^<!-- example-end -->/.test(line),
};

export const extractComponentPath = (line: string) =>
  line.split(" ").find((item) => !/^(<!--|-->|example-start)/.test(item));
