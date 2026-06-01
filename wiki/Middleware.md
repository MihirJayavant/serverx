# Middleware

Middleware is registered globally on the [[Server]] via `addMiddleware()`, or
scoped to a [[Router-and-Actions|Router]] via `router.addMiddleware()`.
Middleware runs in registration order.

```ts
app.addMiddleware(fn); // global
router.addMiddleware(fn); // router-scoped
```

---

## useLogger

Logs every incoming request with method, URL, headers, path parameters, and
query string using [Pino](https://getpino.io).

```ts
import { useLogger } from "@serverx/server";

app.addMiddleware(useLogger());
app.addMiddleware(useLogger({ level: "debug" }));
```

| Option  | Type                                     | Default  | Description       |
| ------- | ---------------------------------------- | -------- | ----------------- |
| `level` | `"debug" \| "info" \| "warn" \| "error"` | `"info"` | Minimum log level |

### Log output

Each request produces a structured JSON log line:

```json
{
  "level": "info",
  "time": 1700000000000,
  "msg": "GET /users/1",
  "fields": {
    "method": "GET",
    "url": "/users/1",
    "params": { "id": "1" },
    "query": {}
  }
}
```

In development, run with `pino-pretty` for readable output:

```bash
deno task user-api | pino-pretty
```

---

## cors

Re-exported directly from [Hono](https://hono.dev/docs/middleware/builtin/cors)
— accepts the same options.

```ts
import { cors } from "@serverx/server";

// Allow all origins
app.addMiddleware(cors());

// Restrict to a specific origin
app.addMiddleware(cors({ origin: "https://example.com" }));

// Multiple origins with credentials
app.addMiddleware(cors({
  origin: ["https://app.example.com", "https://admin.example.com"],
  allowHeaders: ["Authorization", "Content-Type"],
  allowMethods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
```

---

## swaggerUI

Returns a Hono handler that renders the
[Swagger UI](https://swagger.io/tools/swagger-ui/) at the given path.

```ts
import { swaggerUI } from "@serverx/server";

app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
```

| Option    | Type     | Default       | Description                    |
| --------- | -------- | ------------- | ------------------------------ |
| `url`     | `string` | `"/api-docs"` | URL of the OpenAPI JSON spec   |
| `version` | `string` | latest        | Swagger UI CDN version to load |

---

## scalarUI

Returns a Hono handler that renders the
[Scalar API Reference](https://scalar.com) UI.

```ts
import { scalarUI } from "@serverx/server";

app.addOpenApiUi(
  "/scalar-docs",
  scalarUI({
    spec: { url: "/api-docs" },
    theme: "deepSpace",
  }),
);
```

| Option     | Type     | Description                          |
| ---------- | -------- | ------------------------------------ |
| `spec.url` | `string` | URL of the OpenAPI JSON spec         |
| `theme`    | `string` | UI colour theme (see below)          |
| `cdn`      | `string` | Custom CDN URL for the Scalar bundle |

**Available themes:** `alternate`, `default`, `moon`, `purple`, `solarized`,
`bluePlanet`, `deepSpace`, `saturn`, `kepler`, `mars`, `none`

---

## Custom Middleware

Any Hono-compatible middleware function works:

```ts
app.addMiddleware(async (ctx, next) => {
  const token = ctx.req.header("Authorization");
  if (!token) return ctx.json({ error: "Unauthorized" }, 401);
  await next();
});
```

---

## Related

- [[Server]] — registering middleware globally
- [[Router-and-Actions]] — registering middleware scoped to a router
- [[Logger]] — the Logger interface and PinoLogger
