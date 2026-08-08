import type { Context } from "@hono/hono";
import { swaggerUIGen, type SwaggerUIOptions } from "@serverx/utils";

/**
 * Build a handler that renders the Swagger UI. Pass it to
 * `Server.addOpenApiUi` to mount the docs page. `options.url` points to the
 * OpenAPI JSON document (defaults to `/api-docs`).
 */
export function swaggerUI(
  options: SwaggerUIOptions = { url: "/api-docs" },
): (c: Context) => Response {
  return (c: Context) => c.html(swaggerUIGen(options));
}
