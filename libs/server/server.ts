import { Hono } from "@hono/hono";
import type { Context, Next } from "@hono/hono";
import type { Router } from "./router/router.ts";
import { OpenApi, type OpenApiUiOption } from "@serverx/utils";

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
    this.#router.get(config.url ?? "/api-docs", (c) => {
      return c.json(this.#apiDocs.getOpenApiJsonDoc(config));
    });
  }

  addOpenApiUi(path: string, fn: (c: Context) => Response) {
    this.#router.get(path, fn);
  }

  addMiddleware(
    fn: (context: Context, next: Next) => Promise<void | Response>,
  ) {
    this.#router.use(fn);
  }

  serve(
    options:
      | Deno.ServeTcpOptions
      | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem),
  ) {
    Deno.serve(options, this.#router.fetch);
  }
}
