import type { Plugin } from "vite";
import { CreateViteConfigOptions } from "./create-vite-config";
import { github_styles } from "./styles/github-markdown";
import { sveldoc_styles } from "./styles/sveldoc";
import { getPackageJson } from "./utils/get-package-json";

interface PluginIndexOptions
  extends Required<Pick<CreateViteConfigOptions, "resetStyles">> {}

export const pluginIndex = (options: PluginIndexOptions): Plugin => {
  const package_json = getPackageJson();

  return {
    name: "vite:index",
    transformIndexHtml(html, ctx) {
      if (!/^<script/.test(html.trim())) return;

      const is_main_index = ctx.filename.endsWith("index.html");
      const styles = options.resetStyles
        ? ""
        : github_styles({ is_iframe: !is_main_index }) + sveldoc_styles;
      const metadata = is_main_index
        ? `
          <meta name="robots" content="index, follow">
          <title>${package_json.name}</title>
          <meta name="description" content="${package_json.description}" />
        `
        : "";

      return `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              ${metadata}
              <style>${styles}</style>
            </head>
            <body ${options.resetStyles ? "" : 'class="markdown-body"'}>
              ${html}
            </body>
          </html>
        `;
    },
  };
};
