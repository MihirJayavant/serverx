function renderSwaggerUIOptions(options: { url: string }) {
  return `url: '${options.url}'`;
}

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

export function swaggerUIGen(options: SwaggerUIOptions) {
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
