import { Hono } from "@hono/hono";
import type { Context, Next } from "@hono/hono";
import type { Router } from "./router.ts";
import { swaggerUI } from "./open-api/ui.ts";
import { OpenApi, type OpenApiUiOption } from "./open-api/open-api.ts";
import { apiReference, type ApiReferenceOptions } from "./open-api/scalar.ts";

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
  }

  addSwagger(path?: string, config?: OpenApiUiOption) {
    this.#router.get(
      path ?? "/swagger-docs",
      swaggerUI({ url: config?.url ?? "/doc" }),
    );
  }

  addScalar(path?: string, config?: ApiReferenceOptions) {
    this.#router.get(
      path ?? "/scalar-docs",
      apiReference(config ?? { openApiUrl: "/doc" }),
    );
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
