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
import {
  type ContentfulSuccessStatusCode,
  isSuccess,
  OpenApi,
} from "@serverx/utils";

type Config = {
  basePath?: string;
};

/**
 * Request context passed to an {@link Action} handler.
 *
 * @typeParam TBody - Shape of the lazily-parsed JSON request body.
 * @typeParam TQuery - Shape of the parsed query parameters.
 * @typeParam TParam - Shape of the parsed path parameters.
 */
export type ActionContext<TBody = unknown, TQuery = unknown, TParam = unknown> =
  {
    /** Lazily parse and return the JSON request body. */
    body: () => Promise<TBody>;
    /** Parsed query parameters. */
    query: TQuery;
    /** Parsed path parameters. */
    params: TParam;
    /** Underlying Hono context for the request. */
    context: Context;
  };

/** {@link ActionContext} specialized to a typed request body. */
export type ActionBodyContext<TBody> = ActionContext<TBody>;
/** {@link ActionContext} specialized to typed query parameters. */
export type ActionQueryContext<TQuery> = ActionContext<unknown, TQuery>;
/** {@link ActionContext} specialized to typed path parameters. */
export type ActionParamContext<TParam> = ActionContext<
  unknown,
  unknown,
  TParam
>;

/**
 * A route definition combining a request {@link ActionContext} handler with
 * its OpenAPI metadata. `path` and `method` are required; the remaining
 * OpenAPI fields (`tags`, `description`, `parameters`, `responses`) are
 * optional.
 *
 * @typeParam TResult - The success payload returned by the handler's
 * {@link Result}.
 */
export type Action<TResult extends JsonType> = Prettify<
  {
    // deno-lint-ignore no-explicit-any
    handler: (context: ActionContext<any, any, any>) => Task<Result<TResult>>;
  } & OptionalExcept<ApiDocs, "path" | "method">
>;

/**
 * Groups {@link Action}s into a Hono router and builds the matching OpenAPI
 * documentation. Routers can be nested via {@link Router.addSubRouter} and
 * mounted on a {@link Server} with `addRouter`.
 */
export class Router {
  readonly #router;
  readonly #apiDocs: OpenApi = new OpenApi();

  /**
   * @param config - Optional configuration; `basePath` prefixes every route
   * registered on this router.
   */
  constructor(private config?: Config) {
    if (config?.basePath) {
      this.#router = new Hono().basePath(config.basePath);
    } else {
      this.#router = new Hono();
    }
  }

  /** The underlying Hono instance backing this router. */
  get nativeRouter(): Hono {
    return this.#router;
  }

  /** The {@link OpenApi} document accumulated from registered actions. */
  get nativeApiDocs(): OpenApi {
    return this.#apiDocs;
  }

  /** Nest another {@link Router}, merging its routes and OpenAPI metadata. */
  addSubRouter(router: Router) {
    this.#router.route("/", router.#router);
    this.#apiDocs.addSubOpenApi({
      route: "/",
      openApi: router.#apiDocs,
      basePath: this.config?.basePath,
    });
  }

  /**
   * Register an {@link Action}: wire its HTTP route handler and add its
   * OpenAPI metadata to the document.
   */
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
          // For non-contentful responses (204 and redirects), use newResponse
          if (
            result.status === 204 ||
            (result.status >= 300 && result.status < 400)
          ) {
            return c.newResponse(null, result.status);
          }
          // For contentful success responses
          const status = result.status as ContentfulSuccessStatusCode;
          return c.json(result.data, status);
        } else {
          return c.json({ error: result.error }, result.status);
        }
      } catch (error) {
        return c.json({ error }, 500);
      }
    };
  }

  /** Register a middleware applied to every route on this router. */
  addMiddleware(
    fn: (context: Context, next: Next) => Promise<void | Response>,
  ) {
    this.#router.use(fn);
  }
}
