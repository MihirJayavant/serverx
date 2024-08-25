import { Context, Hono } from "@hono/hono";

type Config = {
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
    description: string;
    responses: Record<string, unknown>;
};

export type ApiDocs = {
    path: string;
    description: string;
    method: HttpMethod;
    responses: Record<string, unknown>;
};

export class Router {
    readonly #router;
    readonly #apiDocs: ApiDocs[] = [];

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
        return this.#apiDocs as ReadonlyArray<ApiDocs>;
    }

    addSubRouter(router: Router) {
        this.#router.route("/", router.nativeRouter);
        const docs = router.nativeApiDocs.map((p) => ({
            ...p,
            path: `${this.config?.basePath ?? ""}${p.path}`,
        }));
        this.#apiDocs.concat(docs);
    }

    addAction<T extends object>(action: Action<T>) {
        const method = this.getMethod(action.method);
        method(action.path, this.actionHandler(action.handler));
        this.#apiDocs.push({
            path: `${this.config?.basePath ?? ""}${action.path}`,
            method: action.method,
            description: action.description,
            responses: action.responses,
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
}
