# Runtime Support

ServerX runs natively on both **Deno** and **Node.js** from the same codebase.
The `Server` class is runtime-agnostic — it exposes a universal `fetch` handler
built on Web standards. The only runtime-specific step is starting the server,
so `serve` is published from a dedicated entry point per runtime.

```ts
import { Server } from "@serverx/server";
import { serve } from "@serverx/server/deno"; // or "@serverx/server/node"
```

`@serverx/utils` is built entirely on Web-standard APIs and runs unchanged on
both runtimes — there is nothing runtime-specific to import.

---

## Installation

### Deno

```bash
deno add jsr:@serverx/server jsr:@serverx/utils
```

### Node.js

Install via JSR's npm compatibility, plus the `@hono/node-server` peer
dependency used by the Node.js entry point:

```bash
npx jsr add @serverx/server @serverx/utils
npm install @hono/node-server
```

---

## `Server.fetch`

The `Server` instance exposes a universal `fetch` handler. The `serve` helpers
bind it to a runtime; you can also pass it to any other Web-standard host (Bun,
Cloudflare Workers, etc.) directly.

```ts
get fetch(): (request: Request, ...args) => Response | Promise<Response>;
```

```ts
const app = new Server();
app.addRouter(router);

// Use with any Web-standard runtime
export default { fetch: app.fetch };
```

---

## `serve(server, options)` — Deno

Imported from `@serverx/server/deno`. Thin wrapper over `Deno.serve` that binds
the server's `fetch` handler. Accepts any `Deno.ServeTcpOptions` or TLS options.

```ts
function serve(
  server: Server,
  options: Deno.ServeTcpOptions | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem),
): Deno.HttpServer<Deno.NetAddr>;
```

```ts
import { serve } from "@serverx/server/deno";

serve(app, { port: 3100, hostname: "127.0.0.1" });
```

---

## `serve(server, options)` — Node.js

Imported from `@serverx/server/node`. Binds the server's `fetch` handler to
`@hono/node-server`.

```ts
type NodeServeOptions = {
  port?: number;
  hostname?: string;
};

function serve(server: Server, options?: NodeServeOptions): ServerType;
```

```ts
import { serve } from "@serverx/server/node";

serve(app, { port: 3100, hostname: "127.0.0.1" });
```

---

## Health check system metrics

The built-in health check reports system metrics gathered per runtime
automatically — `Deno` APIs on Deno, `node:os` on Node.js. Override the
`systemMetrics` provider to source metrics elsewhere or to make the check
deterministic in tests.

```ts
type SystemMetrics = {
  cpuLoad: number;
  freeMemory: number;
  totalMemory: number;
};

type SystemMetricsProvider = () => SystemMetrics | Promise<SystemMetrics>;
```

```ts
import { healthCheckHandler } from "@serverx/server";

healthCheckHandler({
  systemMetrics: () => ({ cpuLoad: 0, freeMemory: 0, totalMemory: 0 }),
});
```

---

## Related

- [[Server]] — Server class setup and configuration
- [[Health-Check]] — built-in health check endpoint
- [[Getting-Started]] — installation and first server
