import { Hono } from "@hono/hono";
import type { Context, Next } from "@hono/hono";
import type { Router } from "./router.ts";
import { swaggerUI } from "./open-api/ui.ts";
import { OpenApi, type OpenApiUiOption } from "./open-api/open-api.ts";

export class Server {
  #router = new Hono();
  #apiDocs: OpenApi = new OpenApi();

  addRouter(router: Router) {
    this.#router.route("/", router.nativeRouter);
    const docs = router.nativeApiDocs;
    this.#apiDocs.addSubOpenApi({
      route: "/",
      openApi: docs,
    });
  }

  addOpenApi(config: OpenApiUiOption) {
    this.#router.get(config.url ?? "/doc", (c) => {
      return c.json(this.#apiDocs.getOpenApiJsonDoc(config));
    });
    this.#router.get("/api-docs", swaggerUI({ url: config.url ?? "/doc" }));
  }

  addMiddleware(
    fn: (context: Context, next: Next) => Promise<void | Response>,
  ) {
    this.#router.use("/", fn);
  }

  serve(options: Deno.ServeOptions) {
    Deno.serve(options, this.#router.fetch);
  }
}
