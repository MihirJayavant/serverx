# Project Context: ServerX

ServerX is a Deno-based monorepo that provides a high-performance framework and
utility library designed to **enable Vertical Slice Architecture (VSA)** in Web
APIs. It offers a robust set of core tools and server components that make it
easy to build feature-focused, highly cohesive APIs.

## 🏛️ Architecture: Enabling Vertical Slices

The core libraries (`libs/`) provide the infrastructure, while the project is
optimized for building applications that follow **Vertical Slice Architecture**.
Instead of forced N-Tier layering, ServerX allows developers to group logic by
feature (slice).

### How it supports Vertical Slices:

- **Feature-Centric Routing**: The `Router` and `Action` system makes it easy to
  encapsulate all logic for a feature—from HTTP endpoint definition to data
  access—within a single slice.
- **Low Coupling**: The modular nature of the libraries ensures that slices can
  remain independent and focused.
- **Integrated Utilities**: Built-in support for OpenAPI, validation, and
  standardized results simplifies the creation of self-contained slices.

### Anatomy of a Slice (Example)

In `example/user/`:

- `user.ts`: Models, Zod schemas, and OpenAPI definitions.
- `user.repository.ts`: Data access logic (Mock data/DB).
- `*-user.handler.ts`: Business logic/use cases.
- `controllers/`: (In `example/controllers`) Wiring of handlers to the Router as
  "Actions".

## 📂 Directory Structure

```text
.
├── libs/                # Core library components (Workspace members)
│   ├── server/          # 🚀 Custom server, router, and middleware logic
│   └── utils/           # 🛠️ Helpers for OpenAPI, pagination, results, etc.
├── example/             # 💡 Demonstrative API implementation
│   ├── user/            # 🍰 A vertical slice (Business logic + Repository)
│   ├── controllers/     # 🔌 Routing glue (Actions)
│   └── app.ts           # 🏁 Entry point
├── deno.json            # Workspace and task configuration
└── PROJECT_CONTEXT.md   # This file!
```

## 🛠️ Key Technologies

- **Runtime**: [Deno](https://deno.com/)
- **Language**: TypeScript
- **Validation**: [Zod](https://zod.dev/) (via npm:zod)
- **Documentation**: Automatic OpenAPI (Swagger/Scalar) generation via
  `@serverx/server`.
- **Testing**: Deno Built-in Test Runner.

## 🚀 Getting Started

### Tasks

Common tasks defined in `deno.json`:

- `deno task user-api`: Runs the example API with watch mode.
- `deno task test:api`: Runs integration tests for the example API.
- `deno task util-docs`: Generates HTML documentation for the utils library.

### Adding a New Feature

1. **Create a Slice**: Add a new folder in `example/` (e.g.,
   `example/products/`).
2. **Define Models/Schemas**: Create `products.ts` with Zod/OpenAPI schemas.
3. **Implement Logic**: Add handlers and repositories within the slice folder.
4. **Register Actions**: Create action files in `example/controllers/` that wrap
   your handlers.
5. **Add to Router**: Register the new actions in a Router instance and add it
   to `app.ts`.

## 🤖 AI Assistant Tips

- When adding new functionality, prefer creating a new vertical slice rather
  than adding to existing folders unless they are directly related.
- Use `@serverx/server` and `@serverx/utils` for all server-related logic.
- Ensure all new API endpoints include OpenAPI metadata (tags, descriptions,
  parameters, responses).
