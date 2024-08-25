import { Hono } from "@hono/hono";
import { Router } from "./router.ts";
import { swaggerUI } from "./open-api/open-api.ts";

export class Server {
    #router = new Hono();

    addRouter(router: Router) {
        this.#router.route("/", router.nativeRouter);
    }

    addOpenApi() {
        this.#router.get("/doc", (c) => {
            return c.json({
                openapi: "3.0.0",
                info: {
                    version: "1.0.0",
                    title: "My API",
                },
            });
        });
        this.#router.get("/api-docs", swaggerUI({ url: "/doc" }));
    }

    serve(options: Deno.ServeOptions) {
        Deno.serve(options, this.#router.fetch);
    }
}
