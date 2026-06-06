import { describe, it } from "@std/testing/bdd";
import { assertStringIncludes } from "@std/assert";
import { swaggerUIGen, type SwaggerUIOptions } from "./swagger.ts";

const swaggerUIGenTest = describe(swaggerUIGen.name);

const baseOptions: SwaggerUIOptions = {
  url: "/openapi.json",
};

it(swaggerUIGenTest, "should render a full html document", () => {
  const html = swaggerUIGen(baseOptions);
  assertStringIncludes(html, "<title>SwaggerUI</title>");
  assertStringIncludes(html, '<div id="swagger-ui"></div>');
});

it(swaggerUIGenTest, "should include the spec url", () => {
  const html = swaggerUIGen(baseOptions);
  assertStringIncludes(html, "url: '/openapi.json'");
});

it(
  swaggerUIGenTest,
  "should reference unversioned cdn assets by default",
  () => {
    const html = swaggerUIGen(baseOptions);
    assertStringIncludes(
      html,
      "https://cdn.jsdelivr.net/npm/swagger-ui-dist/swagger-ui.css",
    );
    assertStringIncludes(
      html,
      "https://cdn.jsdelivr.net/npm/swagger-ui-dist/swagger-ui-bundle.js",
    );
  },
);

it(
  swaggerUIGenTest,
  "should pin cdn assets to the provided version",
  () => {
    const html = swaggerUIGen({ ...baseOptions, version: "5.11.0" });
    assertStringIncludes(
      html,
      "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui.css",
    );
    assertStringIncludes(
      html,
      "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-bundle.js",
    );
  },
);

it(
  swaggerUIGenTest,
  "should initialise SwaggerUIBundle on window load",
  () => {
    const html = swaggerUIGen(baseOptions);
    assertStringIncludes(html, "window.onload");
    assertStringIncludes(html, "SwaggerUIBundle({");
    assertStringIncludes(html, "dom_id: '#swagger-ui'");
  },
);
