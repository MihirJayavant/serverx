import { Hono } from "@hono/hono";
import { ApiDocs, Router } from "./router.ts";
import { swaggerUI, SwaggerUIOptions } from "./open-api/open-api.ts";

export class Server {
    #router = new Hono();
    #apiDocs: ApiDocs[] = [];

    addRouter(router: Router) {
        this.#router.route("/", router.nativeRouter);
        const docs = router.nativeApiDocs;
        this.#apiDocs.push(...docs);
    }

    addOpenApi(config?: SwaggerUIOptions) {
        this.#router.get(config?.url ?? "/doc", (c) => {
            return c.json({
                openapi: "3.0.0",
                info: {
                    version: "1.0.0",
                    title: "My API",
                },
                paths: this.formatOpenApiPath(),
            });
        });
        this.#router.get("/api-docs", swaggerUI(config));
    }

    private formatOpenApiPath() {
        // deno-lint-ignore no-explicit-any
        const paths: any = {};
        for (const doc of this.#apiDocs) {
            if (!paths[doc.path]) {
                paths[doc.path] = {};
            }

            paths[doc.path][doc.method.toLowerCase()] = {
                description: doc.description,
                responses: doc.responses,
            };
        }
        return paths;
    }

    serve(options: Deno.ServeOptions) {
        Deno.serve(options, this.#router.fetch);
    }
}
