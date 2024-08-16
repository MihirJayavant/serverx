import { Hono } from "@hono/hono";

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

export type Action = {
    method: HttpMethod;
    path: string;
    handler: () => Promise<void>;
};

export class Router {
    readonly #router = new Hono();

    constructor(config?: Config) {
        if (config?.basePath) {
            this.#router.basePath(config.basePath);
        }
    }

    get nativeRouter() {
        return this.#router;
    }

    addSubRouter(router: Router) {
        this.#router.route("/", router.nativeRouter);
    }

    addAction(action: Action) {
        switch (action.method) {
            case HttpMethod.GET:
                this.#router.get(action.path, action.handler);
                break;
            case HttpMethod.POST:
                this.#router.post(action.path, action.handler);
                break;
            case HttpMethod.PUT:
                this.#router.put(action.path, action.handler);
                break;
            case HttpMethod.PATCH:
                this.#router.patch(action.path, action.handler);
                break;
            case HttpMethod.DELETE:
                this.#router.delete(action.path, action.handler);
                break;
        }
    }
}
