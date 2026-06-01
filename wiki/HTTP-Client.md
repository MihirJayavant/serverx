# HTTP Client

`@serverx/utils` ships a typed fetch wrapper (`HttpClient`) with retry and
circuit breaker support built in — useful for calling external APIs from your
handlers.

```ts
import { CircuitBreaker, HttpClient, withRetry } from "@serverx/utils";
```

---

## HttpClient

### Setup

```ts
import { HttpClient } from "@serverx/utils";

const client = new HttpClient({
  baseUrl: "https://api.example.com",
  headers: {
    Authorization: "Bearer my-token",
    "Content-Type": "application/json",
  },
  retryOptions: {
    maxRetries: 3,
    delayMs: 300,
    useExponentialBackoff: true,
  },
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeoutMs: 10_000,
  },
});
```

| Option           | Type                     | Description                               |
| ---------------- | ------------------------ | ----------------------------------------- |
| `baseUrl`        | `string`                 | Base URL prepended to every path          |
| `headers`        | `Record<string, string>` | Default headers sent with every request   |
| `retryOptions`   | `RetryOptions`           | Retry configuration (see below)           |
| `circuitBreaker` | `CircuitBreakerOptions`  | Circuit breaker configuration (see below) |

### Methods

```ts
// GET
const user = await client.get<User>("/users/1");

// POST
const created = await client.post<User, CreateUserDto>("/users", {
  name: "Alice",
});

// PUT
const updated = await client.put<User, UpdateUserDto>("/users/1", {
  name: "Alice B.",
});

// PATCH
const patched = await client.patch<User, Partial<User>>("/users/1", {
  name: "Alice B.",
});

// DELETE
await client.delete<void>("/users/1");
```

All methods accept an optional second (or third) `options` argument for
per-request headers and other fetch options.

---

## Retry

### `withRetry(fn, options)`

Use `withRetry` directly for one-off calls without an `HttpClient` instance.

```ts
import { withRetry } from "@serverx/utils";

const data = await withRetry(
  () => fetch("https://api.example.com/data").then((r) => r.json()),
  {
    maxRetries: 3,
    delayMs: 500,
    useExponentialBackoff: true,
    shouldRetry: (error) => error?.status >= 500,
  },
);
```

### RetryOptions

| Option                  | Type                          | Default     | Description                                 |
| ----------------------- | ----------------------------- | ----------- | ------------------------------------------- |
| `maxRetries`            | `number`                      | —           | Maximum number of retry attempts            |
| `delayMs`               | `number`                      | —           | Base delay between retries in milliseconds  |
| `useExponentialBackoff` | `boolean`                     | `false`     | Double the delay on each retry              |
| `shouldRetry`           | `(error: unknown) => boolean` | always true | Custom predicate to decide whether to retry |

---

## Circuit Breaker

The circuit breaker prevents cascading failures by stopping calls to a service
that is repeatedly failing.

### States

| State       | Description                                                         |
| ----------- | ------------------------------------------------------------------- |
| `CLOSED`    | Normal operation — requests pass through                            |
| `OPEN`      | Service is failing — requests are blocked immediately               |
| `HALF_OPEN` | Testing recovery — a limited number of requests are allowed through |

### `CircuitBreaker` class

```ts
import {
  CircuitBreaker,
  CircuitBreakerError,
  CircuitState,
} from "@serverx/utils";

const breaker = new CircuitBreaker({
  failureThreshold: 5, // open after 5 consecutive failures
  resetTimeoutMs: 10_000, // try HALF_OPEN after 10 seconds
  successThreshold: 2, // close after 2 successes in HALF_OPEN
});

try {
  const result = await breaker.execute(() => callExternalService());
} catch (e) {
  if (e instanceof CircuitBreakerError) {
    // circuit is OPEN — service is unavailable
  }
}

// Inspect current state
breaker.getState(); // CircuitState.CLOSED | OPEN | HALF_OPEN

// Force state (useful in tests)
breaker.forceState(CircuitState.CLOSED);
```

### CircuitBreakerOptions

| Option                 | Type                          | Default     | Description                                  |
| ---------------------- | ----------------------------- | ----------- | -------------------------------------------- |
| `failureThreshold`     | `number`                      | —           | Consecutive failures before opening          |
| `resetTimeoutMs`       | `number`                      | —           | Milliseconds to wait before trying HALF_OPEN |
| `successThreshold`     | `number`                      | `1`         | Successes in HALF_OPEN before closing        |
| `shouldCountAsFailure` | `(error: unknown) => boolean` | always true | Custom predicate to classify errors          |

### `withCircuitBreaker(fn, breaker)`

Wrapper function for use without the class:

```ts
import { withCircuitBreaker } from "@serverx/utils";

const result = await withCircuitBreaker(() => callExternalService(), breaker);
```

---

## Combined: Retry + Circuit Breaker

When both are configured on `HttpClient`, retries happen first, then the circuit
breaker tracks the final outcome of each call.

```ts
const client = new HttpClient({
  baseUrl: "https://api.example.com",
  retryOptions: { maxRetries: 2, delayMs: 200, useExponentialBackoff: true },
  circuitBreaker: { failureThreshold: 3, resetTimeoutMs: 15_000 },
});
```

---

## Related

- [[Result-Types]] — wrapping client responses in Result
- [[Logger]] — logging client errors
