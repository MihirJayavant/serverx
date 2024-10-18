import type { Context } from "@hono/hono";

export const themes = [
    "alternate",
    "default",
    "moon",
    "purple",
    "solarized",
    "bluePlanet",
    "deepSpace",
    "saturn",
    "kepler",
    "mars",
    "none",
] as const;

export type ApiReferenceOptions = {
    spec: {
        url: string;
    };
    cdn?: string;
    theme?: typeof themes[number];
};

/**
 * The HTML to load the @scalar/api-reference package.
 */
export function createScript(configuration: ApiReferenceOptions) {
    return `
    <script
      id="api-reference"
      type="application/json"
      data-configuration="${
        JSON.stringify(configuration)
            .split('"')
            .join("&quot;")
    }"></script>
      <script src="${
        configuration.cdn ??
            "https://cdn.jsdelivr.net/npm/@scalar/api-reference"
    }"></script>
  `;
}

export function apiReference(options: ApiReferenceOptions) {
    return (c: Context) => {
        return c.html(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>Scalar API Reference</title>
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1" />
      <style>
        ${options.theme ?? "none"}
      </style>
    </head>
    <body>
      ${createScript(options)}
    </body>
  </html>
`);
    };
}
