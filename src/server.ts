import { Hono } from "@hono/hono";
import { Router } from "./router.ts";

export class Server {
    #router = new Hono();

    addRouter(router: Router) {
        this.#router.route("/", router.nativeRouter);
    }

    serve(options: Deno.ServeOptions) {
        Deno.serve(options, this.#router.fetch);
    }
}
