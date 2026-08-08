import type { Context } from "@hono/hono";
import { type ScalarOption, scalarUIGen } from "@serverx/utils";

/**
 * Build a handler that renders the Scalar API reference UI. Pass it to
 * `Server.addOpenApiUi` to mount the docs page.
 */
export function scalarUI(options: ScalarOption): (c: Context) => Response {
  return (c: Context) => c.html(scalarUIGen(options));
}
