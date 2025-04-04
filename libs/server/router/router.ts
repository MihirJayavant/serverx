import { Hono } from "@hono/hono";
import type { Context, Next } from "@hono/hono";
import type {
  ApiDocs,
  HttpMethod,
  JsonType,
  OptionalExcept,
  Prettify,
  Result,
  Task,
} from "@serverx/utils";
import { isSuccess, OpenApi } from "@serverx/utils";

type Config = {
  basePath?: string;
};

export type ActionContext<TBody = unknown, TQuery = unknown, TParam = unknown> =
  {
    body: () => Promise<TBody>;
    query: TQuery;
    params: TParam;
    context: Context;
  };

export type ActionBodyContext<TBody> = ActionContext<TBody>;

export type Action<TResult extends JsonType> = Prettify<
  {
    // deno-lint-ignore no-explicit-any
    handler: (context: ActionContext<any, any, any>) => Task<Result<TResult>>;
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

  get nativeRouter(): Hono {
    return this.#router;
  }

  get nativeApiDocs(): OpenApi {
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

  addAction<T extends JsonType>(action: Action<T>) {
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

  private actionHandler<T extends JsonType>(
    handler: (context: ActionContext) => Task<Result<T>>,
  ) {
    // deno-lint-ignore no-explicit-any
    return async (c: Context<any, any, any>) => {
      const body = () => c.req.json();
      const params = c.req.param();
      const query = c.req.query();
      try {
        const result = await handler({ body, params, query, context: c });
        if (isSuccess(result)) {
          return c.json(result.data, result.status);
        } else {
          return c.json({ error: result.error }, result.status);
        }
      } catch (error) {
        console.error(error);
        return c.json({ error }, 500);
      }
    };
  }

  addMiddleware(
    fn: (context: Context, next: Next) => Promise<void | Response>,
  ) {
    this.#router.use(fn);
  }
}
