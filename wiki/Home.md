# ServerX

[![JSR @serverx/server](https://jsr.io/badges/@serverx/server)](https://jsr.io/@serverx/server)
[![JSR @serverx/utils](https://jsr.io/badges/@serverx/utils)](https://jsr.io/@serverx/utils)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/MihirJayavant/serverx/blob/main/LICENSE)

A Deno framework for building type-safe REST APIs with automatic OpenAPI documentation and [Model Context Protocol (MCP)](https://modelcontextprotocol.io) support out of the box.

---

## Packages

| Package | Description |
|---|---|
| [`@serverx/server`](https://jsr.io/@serverx/server) | HTTP server, router, middleware, and MCP — built on Hono |
| [`@serverx/utils`](https://jsr.io/@serverx/utils) | Result types, pagination, OpenAPI builders, HTTP client |

---

## Features

- **Type-safe routing** — file-per-route Action pattern with full TypeScript inference
- **Automatic OpenAPI** — define metadata alongside the handler; no separate spec writing
- **Zod validation** — input validation built into `baseHandler` with automatic 400 responses
- **MCP support** — expose business logic as AI-agent tools sharing the same handlers as HTTP
- **Structured logging** — Pino-based request logging middleware
- **HTTP client** — typed fetch wrapper with retry and circuit breaker built in
- **Pagination** — offset and cursor helpers ready to plug into any database
- **Health check** — built-in `/healthcheck` with dependency probing and system metrics

---

## Quick Navigation

### Getting Started
- [[Getting-Started]] — Installation, first server, running the example app

### @serverx/server
- [[Server]] — Server class setup and configuration
- [[Router-and-Actions]] — Routing, Action pattern, ActionContext
- [[Base-Handler]] — Zod-validated handler wrapper
- [[Middleware]] — Logger, CORS, Swagger UI, Scalar UI
- [[Health-Check]] — Built-in health check endpoint
- [[MCP]] — Model Context Protocol tools
- [[Virtual-Entity]] — Entity lifecycle abstraction

### @serverx/utils
- [[Result-Types]] — Result<T>, status codes, type guards
- [[HTTP-Client]] — HttpClient, retry, circuit breaker
- [[Pagination]] — Offset and cursor pagination
- [[OpenAPI]] — OpenAPI parameter, response, and UI helpers
- [[Logger]] — Logger interface and PinoLogger
- [[Utility-Types]] — Prettify, StrictOmit, OptionalExcept, and more

### Example
- [[Example-App]] — Full CRUD API walkthrough with Vertical Slice Architecture
