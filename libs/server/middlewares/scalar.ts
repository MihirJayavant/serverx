import type { Context } from "@hono/hono";
import { type ScalarOption, scalarUIGen } from "@serverx/utils";

/**
 * Build a handler that renders the Scalar API reference UI. Pass it to
 * `Server.addOpenApiUi` to mount the docs page.
 *
 * @param options - Scalar options; `url` is the OpenAPI JSON endpoint
 * previously mounted with `Server.addOpenApi`.
 *
 * @example
 * ```ts
 * app.addOpenApi({ url: "/api-docs", openapi: "3.0.0", info });
 * app.addOpenApiUi("/scalar", scalarUI({ url: "/api-docs" }));
 * ```
 */
export function scalarUI(options: ScalarOption): (c: Context) => Response {
  return (c: Context) => c.html(scalarUIGen(options));
}
