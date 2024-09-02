import { Context, Hono } from "@hono/hono";
import { HttpMethod } from "./http/methods.ts";
import { ApiDocs, OpenApi } from "./open-api/open-api.ts";
import { OptionalExcept, Prettify } from "./core/utility.types.ts";

type Config = {
    basePath?: string;
};

export type ActionContext<TBody = unknown, TQuery = unknown, TParam = unknown> =
    {
        body: TBody;
        query: TQuery;
        params: TParam;
        context: Context;
    };

export type ActionBodyContext<TBody> = ActionContext<TBody>;

export type Action<TResult extends object> = Prettify<
    {
        handler: (context: ActionContext) => Promise<TResult>;
    } & OptionalExcept<ApiDocs, "path" | "method">
>;

export class Router {
    readonly #router;
    readonly #apiDocs: OpenApi = new OpenApi();

    constructor(private config?: Config) {
        if (config?.basePath) {
            this.#router = new Hono().basePath(config.basePath);
        } else {
            this.#router = new Hono();
        }
    }

    get nativeRouter() {
        return this.#router;
    }

    get nativeApiDocs() {
        return this.#apiDocs;
    }

    addSubRouter(router: Router) {
        this.#router.route("/", router.#router);
        this.#apiDocs.addSubOpenApi({
            route: "/",
            openApi: router.#apiDocs,
            basePath: this.config?.basePath,
        });
    }

    addAction<T extends object>(action: Action<T>) {
        const method = this.getMethod(action.method);
        method(action.path, this.actionHandler(action.handler));
        this.#apiDocs.addAction({
            ...action,
            basePath: this.config?.basePath,
        });
    }

    private getMethod(type: HttpMethod) {
        switch (type) {
            case "GET":
                return this.#router.get;
            case "POST":
                return this.#router.post;
            case "PUT":
                return this.#router.put;
            case "PATCH":
                return this.#router.patch;
            case "DELETE":
                return this.#router.delete;
        }
    }

    private actionHandler<T extends object>(
        handler: (context: ActionContext) => Promise<T>,
    ) {
        // deno-lint-ignore no-explicit-any
        return async (c: Context<any, any, any>) => {
            let body;
            if (c.req.valid("json")) {
                body = await c.req.json();
            }
            const params = c.req.param();
            const query = c.req.query();

            const result = await handler({ body, params, query, context: c });
            return c.json(result);
        };
    }

    private filterPathName(path: string) {
        return path === "/" ? "" : path;
    }
}
