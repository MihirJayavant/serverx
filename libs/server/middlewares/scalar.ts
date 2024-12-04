import type { Context } from "@hono/hono";
import { type ScalarOption, scalarUIGen } from "@serverx/utils";

export function scalarUI(options: ScalarOption) {
  return (c: Context) => c.html(scalarUIGen(options));
}
