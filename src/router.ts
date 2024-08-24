import { Context, Hono } from "@hono/hono";

export type Config = {
    basePath?: string;
};

export const httpMethods = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
} as const;

export type HttpMethod = keyof typeof httpMethods;

export type ActionContext<TBody = unknown, TQuery = unknown, TParam = unknown> =
    {
        body: TBody;
        query: TQuery;
        params: TParam;
        context: Context;
    };

export type ActionBodyContext<TBody> = ActionContext<TBody>;

export type Action<TResult extends object> = {
    method: HttpMethod;
    path: string;
    handler: (context: ActionContext) => Promise<TResult>;
};

export class Router {
    readonly #router;

    constructor(config?: Config) {
        if (config?.basePath) {
            this.#router = new Hono().basePath(config.basePath);
        } else {
            this.#router = new Hono();
        }
    }

    get nativeRouter() {
        return this.#router;
    }

    addSubRouter(router: Router) {
        this.#router.route("/", router.nativeRouter);
    }

    addAction<T extends object>(action: Action<T>) {
        const method = this.getMethod(action.method);
        method(action.path, this.actionHandler(action.handler));
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
}
