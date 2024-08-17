import { Context, Hono } from "@hono/hono";

export type Config = {
    basePath?: string;
};

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

export type ActionContext = {
    body: any;
    query: any;
    params: any;
    context: Context;
};

export type Action<T> = {
    method: HttpMethod;
    path: string;
    handler: (context: ActionContext) => Promise<T>;
};

export class Router {
    readonly #router;

    constructor(config?: Config) {
        if (config?.basePath) {
            console.log(config);
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
            case HttpMethod.GET:
                return this.#router.get;
            case HttpMethod.POST:
                return this.#router.post;
            case HttpMethod.PUT:
                return this.#router.put;
            case HttpMethod.PATCH:
                return this.#router.patch;
            case HttpMethod.DELETE:
                return this.#router.delete;
        }
    }

    private actionHandler<T extends object>(
        handler: (context: ActionContext) => Promise<T>,
    ) {
        return async (c: Context) => {
            // const body = await c.req.json();
            const body = {};
            const params = c.req.param();
            const query = c.req.query();

            const result = await handler({ body, params, query, context: c });
            console.log(result);
            return c.json({
                ok: true,
                message: "Hello Hono!",
            });
        };
    }
}
