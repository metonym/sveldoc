import type { Plugin } from "vite";

export const pluginIndex = (): Plugin => {
  return {
    name: "vite:index",
    transformIndexHtml(html) {
      // TODO: apply only if index.html only contains a script
      return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body>
            ${html}
          </body>
        </html>
      `;
    },
  };
};
