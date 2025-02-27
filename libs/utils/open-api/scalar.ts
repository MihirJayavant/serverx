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

/**
 * Scalar option
 * @property spec - The url of the scalar api reference.
 * @property cdn - The cdn url of the scalar api reference.
 * @property theme - The theme of the scalar api reference.
 */
export type ScalarOption = {
  spec: {
    url: string;
  };
  cdn?: string;
  theme?: typeof themes[number];
};

/**
 * Load the @scalar/api-reference package
 * @param configuration scalar config
 * @returns html sctript
 */
function createScript(configuration: ScalarOption) {
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

/**
 * Helper function to generate scalar ui
 * @param options - The options for the scalar ui.
 * @returns - The generated scalar ui.
 */
export function scalarUIGen(options: ScalarOption): string {
  return `
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
`;
}
