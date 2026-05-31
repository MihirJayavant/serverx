# Health Check

ServerX provides a built-in health check handler that reports dependency status and system metrics. Register it via `app.addHealthCheck()`.

```ts
import { healthCheckHandler, healthCheckResponse } from "@serverx/server";
import { httpMethods } from "@serverx/utils";
```

---

## Basic Setup

```ts
import { healthCheckHandler, healthCheckResponse } from "@serverx/server";
import { httpMethods } from "@serverx/utils";

app.addHealthCheck({
  path: "/healthcheck",
  method: httpMethods.GET,
  tags: ["system"],
  description: "Service health check",
  responses: healthCheckResponse(),
  handler: () => healthCheckHandler(),
});
```

---

## Checking Dependencies

Pass a `dependencies` array to probe external services. Each dependency runs an async `check()` that returns `true` (healthy) or `false` (unhealthy).

```ts
handler: () =>
  healthCheckHandler({
    dependencies: [
      {
        name: "database",
        check: () => db.ping().then(() => true).catch(() => false),
      },
      {
        name: "cache",
        check: () => redis.ping().then(() => true).catch(() => false),
      },
    ],
  }),
```

---

## Response Shape

### All healthy — `200 OK`

```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "checks": [
    { "name": "database", "healthy": true },
    { "name": "cache", "healthy": true }
  ],
  "systemMetrics": {
    "cpuLoad": 0.42,
    "freeMemory": 2048,
    "totalMemory": 8192
  }
}
```

### Any dependency unhealthy — `500 Internal Server Error`

```json
{
  "status": "unhealthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "checks": [
    { "name": "database", "healthy": true },
    { "name": "cache", "healthy": false }
  ],
  "systemMetrics": {
    "cpuLoad": 1.85,
    "freeMemory": 512,
    "totalMemory": 8192
  }
}
```

### System metrics

| Field | Description |
|---|---|
| `cpuLoad` | 1-minute CPU load average |
| `freeMemory` | Free memory in MB |
| `totalMemory` | Total system memory in MB |

---

## OpenAPI Metadata

`healthCheckResponse()` returns pre-built OpenAPI response schemas covering both the `200` and `500` cases, so you do not need to write them manually.

```ts
responses: healthCheckResponse(),
```

---

## Related

- [[Server]] — `addHealthCheck()` method
- [[Result-Types]] — the Result type returned by the handler
