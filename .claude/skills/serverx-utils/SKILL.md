---
name: serverx-utils
description: API reference and type constraints for @serverx/utils (libs/utils) — Result types (successResult, errorResult, internalServerError, isSuccess, isError, statusCodes, httpMethods), utility types (JsonType, Task, Prettify, OptionalExcept, StrictOmit), offset and cursor pagination, filters, OpenAPI builders (openApiParameter, openApiResponse, openApiRequestBody, OpenApi, swaggerUIGen, scalarUIGen), HttpClient with retry and circuit breaker, and the Logger interface. Use when returning results from a handler, shaping OpenAPI metadata, paginating a list, calling an external API, or touching any code under libs/utils.
---

# @serverx/utils

Runtime-agnostic helpers shared by the server library and every app built on it.
Every symbol below is exported from `libs/utils/mod.ts`.

For exact signatures run `deno doc libs/utils/mod.ts`. For narrative docs read
the wiki page named in the routing table — that is the source of truth, so don't
restate it here.

## Exports

**Results & status codes**

| Symbol                                                                                                                                      | Purpose                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `successResult(data, status?)`                                                                                                              | 2xx/3xx result; `null` data for 204 and 3xx |
| `errorResult(error, status)`                                                                                                                | 4xx/5xx result                              |
| `internalServerError(error)`                                                                                                                | 500 result — use in `catch` blocks          |
| `isSuccess` / `isError`                                                                                                                     | Type guards narrowing `Result<T>`           |
| `statusCodes`                                                                                                                               | Named HTTP status constants                 |
| `httpMethods` / `HttpMethod`                                                                                                                | `GET`/`POST`/`PUT`/`PATCH`/`DELETE`         |
| `Result<T>`, `SuccessResult<T>`, `ErrorResult`                                                                                              | The result union and its members            |
| `ContentfulSuccessResult` / `NonContentfulSuccessResult`                                                                                    | With-body vs 204/3xx variants               |
| `StatusCode`, `SuccessStatusCode`, `ContentfulSuccessStatusCode`, `NonContentfulSuccessStatusCode`, `RedirectStatusCode`, `ErrorStatusCode` | Status-code unions                          |

**Utility types** — `JsonType`, `JsonArray`, `Task<T>`, `Prettify<T>`,
`StrictOmit<T, K>`, `OptionalExcept<T, K>`.

**Pagination & filtering**

| Symbol                                                                                    | Purpose                                     |
| ----------------------------------------------------------------------------------------- | ------------------------------------------- |
| `offsetPaginate(input)`                                                                   | Build an offset-paginated result            |
| `offsetPaginationParamSchema`                                                             | Ready-made OpenAPI params for offset paging |
| `OffsetPaginationParams` / `OffsetPaginatedResult<T>`                                     | Offset input and output shapes              |
| `CursorPaginationParams` / `CursorPaginatedResult<T>`                                     | Cursor shapes (types only — no helper)      |
| `convertSelector(selector)`                                                               | Map filter params to a DB-library selector  |
| `FilteringParams`, `FilterValueType`, `SortingParams`, `SelectorParams<T>`, `Selector<T>` | Filter and sort inputs                      |

**OpenAPI**

| Symbol                                                                                                                                                                                                            | Purpose                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `openApiParameter(...params)`                                                                                                                                                                                     | **Variadic** — path/query/header parameters                         |
| `openApiResponse(...responses)`                                                                                                                                                                                   | **Variadic** — response schemas by status                           |
| `openApiRequestBody(body)`                                                                                                                                                                                        | Single argument — request body schema                               |
| `OpenApi`                                                                                                                                                                                                         | Document builder: `addAction`, `addSubOpenApi`, `getOpenApiJsonDoc` |
| `swaggerUIGen` / `scalarUIGen`                                                                                                                                                                                    | Render docs UI HTML (`themes` for Scalar)                           |
| `ApiDocs`, `SchemaProperty`, `ParameterType`, `RequestType`, `ResponseType`, `OpenApiRequestBody`, `OpenApiResponse`, `OpenApiUiOption`, `SwaggerUIOptions`, `ScalarOption`, `AssetURLs`, `OpenApiQueryTransform` | Supporting types                                                    |

**HTTP client** — `HttpClient`, `HttpClientOptions`, `RetryOptions`,
`CircuitBreaker`, `CircuitBreakerOptions`, `CircuitBreakerError`,
`CircuitState`.

**Logging** — `Logger`, `LogLevel`, `LoggerConfig`, `LoggerPayload`. Interface
only; the `PinoLogger` implementation lives in `@serverx/server`.

## Where the details live

| Topic                          | Wiki page               |
| ------------------------------ | ----------------------- |
| `Result<T>`, status codes      | `wiki/Result-Types.md`  |
| Offset & cursor pagination     | `wiki/Pagination.md`    |
| OpenAPI builders and UIs       | `wiki/OpenAPI.md`       |
| HttpClient, retry, breaker     | `wiki/HTTP-Client.md`   |
| Logger interface & PinoLogger  | `wiki/Logger.md`        |
| Prettify, OptionalExcept, etc. | `wiki/Utility-Types.md` |

## Constraints and gotchas

1. **Never hand-build a result object.** Always go through `successResult`,
   `errorResult`, or `internalServerError` (`libs/utils/result/result.ts`) — the
   status-code unions are what keep the router's contentful/non-contentful
   branching correct.

2. **`JsonType` is an index-signature object, and `JsonArray` does not satisfy
   it** (`libs/utils/utility.types.ts:32-47`). Since handler output is
   constrained to `JsonType`, a bare array cannot be returned — wrap it as
   `{ data: T[] }`. See `example/user/get-users.handler.ts:9-11`.

3. **Narrow with the guards, not with the status number.** `isSuccess(result)`
   and `isError(result)` are typed predicates; comparing `result.status` gives
   TypeScript nothing.

4. **`ErrorResult.error` is `unknown` by design.** Narrow it at the consumer
   rather than asserting a shape at the producer.

5. **`null` data is how you express "no body".**
   `successResult(null, statusCodes.NoContent)` yields
   `NonContentfulSuccessResult`; redirect codes (301/302/304) behave the same
   way.

6. **`openApiParameter` and `openApiResponse` are variadic; `openApiRequestBody`
   is not.** Pass parameters and responses as separate arguments, not as an
   array.

7. **Don't hand-roll paging.** `offsetPaginate` builds the result and
   `offsetPaginationParamSchema` supplies the matching OpenAPI parameters.
   Cursor pagination currently ships as **types only** — there is no
   `cursorPaginate` helper.

8. **An open circuit breaker throws `CircuitBreakerError`, which is not an HTTP
   failure.** `HttpClient` composes `retryOptions` and `circuitBreaker`
   (`libs/utils/http/client.ts`); distinguish a blocked call from a failed one
   when mapping to a `Result`.

9. **Keep this package runtime-agnostic.** No Hono, no `Deno.*` APIs that break
   under Node — that constraint is why `Logger` is an interface here and
   `PinoLogger` lives in `@serverx/server`.

## Related commands

`/add-lib-feature utils <name>` to add a feature here, `/unit-test` for specs
(they must run with no permission flags), `/document-api utils` for JSDoc plus
regenerated HTML docs.
