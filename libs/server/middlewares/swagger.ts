import type { Context } from "@hono/hono";
import { swaggerUIGen, type SwaggerUIOptions } from "@serverx/utils";

export function swaggerUI(
  options: SwaggerUIOptions = { url: "/api-docs" },
): (c: Context) => Response {
  return (c: Context) => c.html(swaggerUIGen(options));
}
