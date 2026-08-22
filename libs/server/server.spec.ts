import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  httpMethods,
  type OpenApiUiOption,
  successResult,
} from "@serverx/utils";
import { Server } from "./server.ts";
import { Router } from "./router/router.ts";
import {
  healthCheckHandler,
  healthCheckResponse,
} from "./handlers/healthcheck.ts";
import type { SystemMetricsProvider } from "./handlers/system-metrics.ts";

const docOptions: OpenApiUiOption = {
  url: "/api-docs",
  openapi: "3.0.0",
  info: { version: "1.0.0", title: "Test API" },
};

const systemMetrics: SystemMetricsProvider = () => ({
  cpuLoad: 1.5,
  freeMemory: 1024,
  totalMemory: 4096,
});

function userRouter() {
  const router = new Router({ basePath: "/api" });
  router.addAction({
    path: "/users/:id",
    method: "GET",
    tags: ["User"],
    description: "Get a user",
    handler: () => successResult({ id: 1 }),
  });
  return router;
}

function request(path: string) {
  return new Request(`http://localhost${path}`);
}

const addRouterTest = describe("Server.addRouter");

it(addRouterTest, "should route requests to the mounted router", async () => {
  const app = new Server();
  app.addRouter(userRouter());

  const response = await app.fetch(request("/api/users/1"));

  assertEquals(response.status, 200);
  assertEquals(await response.json(), { id: 1 });
});

it(addRouterTest, "should merge the router documentation", async () => {
  const app = new Server();
  app.addRouter(userRouter());
  app.addOpenApi(docOptions);

  const response = await app.fetch(request("/api-docs"));
  const docs = await response.json();

  assertEquals(Object.keys(docs.paths), ["/api/users/{id}"]);
  assertEquals(docs.paths["/api/users/{id}"].get.tags, ["User"]);
});

const addOpenApiTest = describe("Server.addOpenApi");

it(
  addOpenApiTest,
  "should serve the document at the configured url",
  async () => {
    const app = new Server();
    app.addOpenApi({ ...docOptions, url: "/openapi.json" });

    const response = await app.fetch(request("/openapi.json"));

    assertEquals(response.status, 200);
    assertEquals(await response.json(), {
      openapi: "3.0.0",
      info: { version: "1.0.0", title: "Test API" },
      paths: {},
    });
  },
);

it(addOpenApiTest, "should fall back to the default url", async () => {
  const app = new Server();
  app.addOpenApi({
    openapi: "3.0.0",
    info: { version: "1.0.0", title: "Test API" },
  } as OpenApiUiOption);

  const response = await app.fetch(request("/api-docs"));

  assertEquals(response.status, 200);
});

const addOpenApiUiTest = describe("Server.addOpenApiUi");

it(addOpenApiUiTest, "should serve the ui handler response", async () => {
  const app = new Server();
  app.addOpenApiUi("/swagger-docs", (c) => c.html("<html>docs</html>"));

  const response = await app.fetch(request("/swagger-docs"));

  assertEquals(response.status, 200);
  assertEquals(await response.text(), "<html>docs</html>");
});

const addMiddlewareTest = describe("Server.addMiddleware");

it(
  addMiddlewareTest,
  "should apply the middleware to every request",
  async () => {
    const paths: string[] = [];
    const app = new Server();
    app.addMiddleware(async (context, next) => {
      paths.push(new URL(context.req.url).pathname);
      await next();
    });
    app.addRouter(userRouter());
    app.addOpenApi(docOptions);

    await app.fetch(request("/api/users/1"));
    await app.fetch(request("/api-docs"));

    assertEquals(paths, ["/api/users/1", "/api-docs"]);
  },
);

const addHealthCheckTest = describe("Server.addHealthCheck");

it(addHealthCheckTest, "should serve a healthy check", async () => {
  const app = new Server();
  app.addHealthCheck({
    path: "/healthcheck",
    method: httpMethods.GET,
    responses: healthCheckResponse(),
    handler: () =>
      healthCheckHandler({
        systemMetrics,
        dependencies: [{ name: "db", check: () => Promise.resolve(true) }],
      }),
  });

  const response = await app.fetch(request("/healthcheck"));
  const body = await response.json();

  assertEquals(response.status, 200);
  assertEquals(body.status, "healthy");
  assertEquals(body.checks, [{ name: "db", healthy: true }]);
});

it(addHealthCheckTest, "should serve an unhealthy check", async () => {
  const app = new Server();
  app.addHealthCheck({
    path: "/healthcheck",
    method: httpMethods.GET,
    handler: () =>
      healthCheckHandler({
        systemMetrics,
        dependencies: [{ name: "db", check: () => Promise.resolve(false) }],
      }),
  });

  const response = await app.fetch(request("/healthcheck"));
  const body = await response.json();

  assertEquals(response.status, 500);
  assertEquals(body.error.status, "unhealthy");
  assertEquals(body.error.checks, [{ name: "db", healthy: false }]);
});

const fetchTest = describe("Server.fetch");

it(fetchTest, "should return not found for an unregistered path", async () => {
  const app = new Server();
  app.addRouter(userRouter());

  const response = await app.fetch(request("/unknown"));

  assertEquals(response.status, 404);
});
