# Logger

ServerX uses a two-layer logging design:

- **`Logger`** (from `@serverx/utils`) — a lightweight interface that any
  implementation can satisfy
- **`PinoLogger`** (from `@serverx/server`) — the concrete
  [Pino](https://getpino.io)-based implementation
- **`useLogger`** (from `@serverx/server`) — middleware that wires `PinoLogger`
  into the request lifecycle

---

## Logger Interface

```ts
import type { Logger, LoggerConfig, LoggerPayload } from "@serverx/utils";
```

```ts
type LogLevel = "debug" | "info" | "warn" | "error";

type LoggerConfig = {
  level?: LogLevel;
};

type LoggerPayload = {
  fields?: Record<string, unknown>; // structured key-value data
  args?: unknown[]; // arbitrary extra values
};

type Logger = {
  debug(message: string, payload?: LoggerPayload): void;
  info(message: string, payload?: LoggerPayload): void;
  warn(message: string, payload?: LoggerPayload): void;
  error(message: string, payload?: LoggerPayload): void;
};
```

Depend on the interface — not the concrete class — to keep your business logic
decoupled from the logging implementation.

---

## PinoLogger

`PinoLogger` implements `Logger` using [Pino](https://getpino.io) for structured
JSON output.

```ts
import { PinoLogger } from "@serverx/server";

const logger = new PinoLogger({ level: "debug" });
```

### Usage

```ts
logger.info("server started", { fields: { port: 3100 } });
logger.debug("cache miss", { fields: { key: "user:1" } });
logger.warn("high memory usage", { fields: { freeMb: 128 } });
logger.error("unhandled exception", { args: [err] });
```

Each call produces a structured JSON log line:

```json
{
  "level": "info",
  "time": 1700000000000,
  "msg": "server started",
  "port": 3100
}
```

### Log levels

| Level   | Description                           |
| ------- | ------------------------------------- |
| `debug` | Verbose development output            |
| `info`  | Normal operational messages (default) |
| `warn`  | Unexpected but recoverable situations |
| `error` | Errors that need attention            |

Only messages at or above the configured level are emitted.

---

## useLogger Middleware

`useLogger` creates a `PinoLogger` and logs every incoming request
automatically.

```ts
import { useLogger } from "@serverx/server";

app.addMiddleware(useLogger());
app.addMiddleware(useLogger({ level: "debug" }));
```

Each request produces a log entry with:

```json
{
  "level": "info",
  "msg": "GET /users/1",
  "fields": {
    "method": "GET",
    "url": "/users/1",
    "params": { "id": "1" },
    "query": {}
  }
}
```

### Pretty output in development

Pipe through `pino-pretty`:

```bash
deno task user-api | pino-pretty
```

---

## Using Logger in Business Logic

Inject the `Logger` interface into your handlers or services to avoid coupling
to Pino:

```ts
import type { Logger } from "@serverx/utils";

export function makeUserService(logger: Logger) {
  return {
    async getUser(id: string) {
      logger.debug("fetching user", { fields: { id } });
      const user = await db.users.findById(id);
      if (!user) logger.warn("user not found", { fields: { id } });
      return user;
    },
  };
}
```

---

## Related

- [[Middleware]] — `useLogger` middleware setup
- [[Server]] — registering middleware globally
