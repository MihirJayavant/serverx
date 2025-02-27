function renderSwaggerUIOptions(options: { url: string }) {
  return `url: '${options.url}'`;
}

/**
 * Asset url
 * @property css - The css files to be loaded.
 * @property js - The js files to be loaded.
 */
export type AssetURLs = {
  css: string[];
  js: string[];
};

const remoteAssets = ({ version }: { version?: string }): AssetURLs => {
  const url = `https://cdn.jsdelivr.net/npm/swagger-ui-dist${
    version ? `@${version}` : ""
  }`;

  return {
    css: [`${url}/swagger-ui.css`],
    js: [`${url}/swagger-ui-bundle.js`],
  };
};

/**
 * Swagger UI options
 * @property url - The url of the swagger ui.
 * @property version - The version of the swagger ui.
 */
export type SwaggerUIOptions = {
  url: string;
  version?: string;
};

function swaggerUITrigger(options: SwaggerUIOptions) {
  const { version, ...rest } = options;
  const asset = remoteAssets({ version });
  const optionsStrings = renderSwaggerUIOptions(rest);

  return `
    <div>
      <div id="swagger-ui"></div>
      ${asset.css.map((url) => `<link rel="stylesheet" href="${url}" />`)}
      ${
    asset.js.map((url) =>
      `<script src="${url}" crossorigin="anonymous"></script>`
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

/**
 * Helper function to generate swagger ui
 * @param options - The options for the swagger ui.
 * @returns - The generated swagger ui.
 */
export function swaggerUIGen(options: SwaggerUIOptions): string {
  return `
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="SwaggerUI" />
          <title>SwaggerUI</title>
        </head>
        <body>
          ${swaggerUITrigger(options)}
        </body>
      </html>`;
}
