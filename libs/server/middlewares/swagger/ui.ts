import type { Context } from "@hono/hono";
import { html } from "@hono/hono/html";
import {
  type DistSwaggerUIOptions,
  renderSwaggerUIOptions,
} from "./swagger.ts";

export type AssetURLs = {
  css: string[];
  js: string[];
};

type ResourceConfig = {
  version?: string;
};

export const remoteAssets = ({ version }: ResourceConfig): AssetURLs => {
  const url = `https://cdn.jsdelivr.net/npm/swagger-ui-dist${
    version !== undefined ? `@${version}` : ""
  }`;

  return {
    css: [`${url}/swagger-ui.css`],
    js: [`${url}/swagger-ui-bundle.js`],
  };
};

type OriginalSwaggerUIOptions = {
  version?: string;
  manuallySwaggerUIHtml?: (asset: AssetURLs) => string;
};

export type SwaggerUIOptions = OriginalSwaggerUIOptions & DistSwaggerUIOptions;

function swaggerUIGen(options: SwaggerUIOptions) {
  const asset = remoteAssets({ version: options?.version });
  delete options.version;

  if (options.manuallySwaggerUIHtml) {
    return options.manuallySwaggerUIHtml(asset);
  }

  const optionsStrings = renderSwaggerUIOptions(options);

  return `
    <div>
      <div id="swagger-ui"></div>
      ${asset.css.map((url) => html`<link rel="stylesheet" href="${url}" />`)}
      ${
    asset.js.map((url) =>
      html`<script src="${url}" crossorigin="anonymous"></script>`
    )
  }
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            dom_id: '#swagger-ui',${optionsStrings},
          })
        }
      </script>
    </div>
  `;
}

export function swaggerUI(options: SwaggerUIOptions = { url: "/doc" }) {
  return (c: Context) => {
    return c.html(`
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="SwaggerUI" />
          <title>SwaggerUI</title>
        </head>
        <body>
          ${swaggerUIGen(options)}
        </body>
      </html>
    `);
  };
}
