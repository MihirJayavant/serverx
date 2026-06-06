import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes } from "@std/assert";
import { type ScalarOption, scalarUIGen } from "./scalar.ts";

const scalarUIGenTest = describe(scalarUIGen.name);

const baseOptions: ScalarOption = {
  spec: { url: "/openapi.json" },
};

it(scalarUIGenTest, "should render a full html document", () => {
  const html = scalarUIGen(baseOptions);
  assertStringIncludes(html, "<!DOCTYPE html>");
  assertStringIncludes(html, "<title>Scalar API Reference</title>");
});

it(
  scalarUIGenTest,
  "should embed the configuration with escaped quotes",
  () => {
    const html = scalarUIGen(baseOptions);
    const escaped = JSON.stringify(baseOptions).split('"').join("&quot;");
    assertStringIncludes(html, `data-configuration="${escaped}"`);
    // Raw double quotes from the JSON config must not leak into the attribute.
    assertEquals(html.includes('data-configuration="{"'), false);
  },
);

it(
  scalarUIGenTest,
  "should use the default jsdelivr cdn when none provided",
  () => {
    const html = scalarUIGen(baseOptions);
    assertStringIncludes(
      html,
      'src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"',
    );
  },
);

it(scalarUIGenTest, "should use a custom cdn when provided", () => {
  const html = scalarUIGen({
    ...baseOptions,
    cdn: "https://example.com/scalar.js",
  });
  assertStringIncludes(html, 'src="https://example.com/scalar.js"');
});

it(scalarUIGenTest, "should fall back to the 'none' theme by default", () => {
  const html = scalarUIGen(baseOptions);
  assertStringIncludes(html, "none");
});

it(scalarUIGenTest, "should include the provided theme", () => {
  const html = scalarUIGen({ ...baseOptions, theme: "moon" });
  assertStringIncludes(html, "moon");
});
