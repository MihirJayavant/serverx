import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  errorResult,
  type OpenApiUiOption,
  statusCodes,
  successResult,
} from "@serverx/utils";
import {
  type ActionContext,
  type ActionParamContext,
  type ActionQueryContext,
  Router,
} from "./router.ts";

const docOptions: OpenApiUiOption = {
  url: "/api-docs",
  openapi: "3.0.0",
  info: { version: "1.0.0", title: "Test API" },
};

function request(path: string, init?: RequestInit) {
  return new Request(`http://localhost${path}`, init);
}

const addActionTest = describe("Router.addAction");

it(addActionTest, "should route a GET action", async () => {
  const router = new Router();
  router.addAction({
    path: "/users",
    method: "GET",
    handler: () => successResult({ method: "GET" }),
  });

  const response = await router.nativeRouter.fetch(request("/users"));

  assertEquals(response.status, 200);
  assertEquals(await response.json(), { method: "GET" });
});

it(addActionTest, "should route a POST action", async () => {
  const router = new Router();
  router.addAction({
    path: "/users",
    method: "POST",
    handler: () => successResult({ method: "POST" }),
  });

  const response = await router.nativeRouter.fetch(
    request("/users", { method: "POST" }),
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), { method: "POST" });
});

it(addActionTest, "should route a PUT action", async () => {
  const router = new Router();
  router.addAction({
    path: "/users/:id",
    method: "PUT",
    handler: () => successResult({ method: "PUT" }),
  });

  const response = await router.nativeRouter.fetch(
    request("/users/1", { method: "PUT" }),
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), { method: "PUT" });
});

it(addActionTest, "should route a PATCH action", async () => {
  const router = new Router();
  router.addAction({
    path: "/users/:id",
    method: "PATCH",
    handler: () => successResult({ method: "PATCH" }),
  });

  const response = await router.nativeRouter.fetch(
    request("/users/1", { method: "PATCH" }),
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), { method: "PATCH" });
});

it(addActionTest, "should route a DELETE action", async () => {
  const router = new Router();
  router.addAction({
    path: "/users/:id",
    method: "DELETE",
    handler: () => successResult({ method: "DELETE" }),
  });

  const response = await router.nativeRouter.fetch(
    request("/users/1", { method: "DELETE" }),
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), { method: "DELETE" });
});

it(
  addActionTest,
  "should return the created status for a 201 result",
  async () => {
    const router = new Router();
    router.addAction({
      path: "/users",
      method: "POST",
      handler: () => successResult({ id: 1 }, statusCodes.Created),
    });

    const response = await router.nativeRouter.fetch(
      request("/users", { method: "POST" }),
    );

    assertEquals(response.status, 201);
    assertEquals(await response.json(), { id: 1 });
  },
);

it(
  addActionTest,
  "should return an empty body for a no content result",
  async () => {
    const router = new Router();
    router.addAction({
      path: "/users/:id",
      method: "DELETE",
      handler: () => successResult(null, statusCodes.NoContent),
    });

    const response = await router.nativeRouter.fetch(
      request("/users/1", { method: "DELETE" }),
    );

    assertEquals(response.status, 204);
    assertEquals(await response.text(), "");
  },
);

it(
  addActionTest,
  "should return an empty body for a redirect result",
  async () => {
    const router = new Router();
    router.addAction({
      path: "/users",
      method: "GET",
      handler: () => successResult(null, statusCodes.Found),
    });

    const response = await router.nativeRouter.fetch(request("/users"));

    assertEquals(response.status, 302);
    assertEquals(await response.text(), "");
  },
);

it(addActionTest, "should return the error status and message", async () => {
  const router = new Router();
  router.addAction({
    path: "/users/:id",
    method: "GET",
    handler: () => errorResult("User not found", statusCodes.NotFound),
  });

  const response = await router.nativeRouter.fetch(request("/users/1"));

  assertEquals(response.status, 404);
  assertEquals(await response.json(), { error: "User not found" });
});

it(
  addActionTest,
  "should return a server error when the handler throws",
  async () => {
    const router = new Router();
    router.addAction({
      path: "/users",
      method: "GET",
      handler: () => {
        throw new Error("boom");
      },
    });

    const response = await router.nativeRouter.fetch(request("/users"));

    // An Error instance has no enumerable properties, so it serializes to `{}`.
    assertEquals(response.status, 500);
    assertEquals(await response.json(), { error: {} });
  },
);

it(addActionTest, "should pass the path params to the handler", async () => {
  const router = new Router();
  router.addAction({
    path: "/users/:userId/posts/:postId",
    method: "GET",
    handler: (
      context: ActionParamContext<{ userId: string; postId: string }>,
    ) => successResult(context.params),
  });

  const response = await router.nativeRouter.fetch(request("/users/1/posts/2"));

  assertEquals(await response.json(), { userId: "1", postId: "2" });
});

it(addActionTest, "should pass the query params to the handler", async () => {
  const router = new Router();
  router.addAction({
    path: "/users",
    method: "GET",
    handler: (context: ActionQueryContext<{ page: string; size: string }>) =>
      successResult(context.query),
  });

  const response = await router.nativeRouter.fetch(
    request("/users?page=2&size=10"),
  );

  assertEquals(await response.json(), { page: "2", size: "10" });
});

it(addActionTest, "should parse the json body when requested", async () => {
  const router = new Router();
  router.addAction({
    path: "/users",
    method: "POST",
    handler: async (context: ActionContext<{ name: string }>) =>
      successResult(await context.body()),
  });

  const response = await router.nativeRouter.fetch(
    request("/users", {
      method: "POST",
      body: JSON.stringify({ name: "John Doe" }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  assertEquals(await response.json(), { name: "John Doe" });
});

it(
  addActionTest,
  "should not parse the body when it is never awaited",
  async () => {
    const router = new Router();
    router.addAction({
      path: "/users",
      method: "POST",
      handler: () => successResult({ parsed: false }),
    });

    const response = await router.nativeRouter.fetch(
      request("/users", {
        method: "POST",
        body: "not json",
        headers: { "Content-Type": "application/json" },
      }),
    );

    assertEquals(response.status, 200);
    assertEquals(await response.json(), { parsed: false });
  },
);

it(addActionTest, "should prefix the route with the base path", async () => {
  const router = new Router({ basePath: "/api" });
  router.addAction({
    path: "/users",
    method: "GET",
    handler: () => successResult({ id: 1 }),
  });

  const prefixed = await router.nativeRouter.fetch(request("/api/users"));
  const unprefixed = await router.nativeRouter.fetch(request("/users"));

  assertEquals(prefixed.status, 200);
  assertEquals(unprefixed.status, 404);
});

it(addActionTest, "should document the action with its base path", () => {
  const router = new Router({ basePath: "/api" });
  router.addAction({
    path: "/users/:id",
    method: "GET",
    tags: ["User"],
    description: "Get a user",
    parameters: [{ name: "id", in: "path" }],
    responses: { "200": { description: "User" } },
    handler: () => successResult({ id: 1 }),
  });

  const docs = router.nativeApiDocs.getOpenApiJsonDoc(docOptions);

  assertEquals(Object.keys(docs.paths), ["/api/users/{id}"]);
  assertEquals(docs.paths["/api/users/{id}"].get.tags, ["User"]);
  assertEquals(docs.paths["/api/users/{id}"].get.description, "Get a user");
  assertEquals(docs.paths["/api/users/{id}"].get.parameters, [
    { name: "id", in: "path" },
  ]);
  assertEquals(docs.paths["/api/users/{id}"].get.responses, {
    "200": { description: "User" },
  });
});

it(addActionTest, "should default the optional documentation fields", () => {
  const router = new Router();
  router.addAction({
    path: "/users",
    method: "GET",
    handler: () => successResult({ id: 1 }),
  });

  const docs = router.nativeApiDocs.getOpenApiJsonDoc(docOptions);

  assertEquals(docs.paths["/users"].get.tags, []);
  assertEquals(docs.paths["/users"].get.description, "");
  assertEquals(docs.paths["/users"].get.parameters, []);
  assertEquals(docs.paths["/users"].get.responses, {});
  assertEquals(docs.paths["/users"].get.requestBody, {});
});

const addSubRouterTest = describe("Router.addSubRouter");

it(addSubRouterTest, "should route to the nested router actions", async () => {
  const child = new Router();
  child.addAction({
    path: "/users",
    method: "GET",
    handler: () => successResult({ id: 1 }),
  });

  const parent = new Router({ basePath: "/api" });
  parent.addSubRouter(child);

  const response = await parent.nativeRouter.fetch(request("/api/users"));

  assertEquals(response.status, 200);
  assertEquals(await response.json(), { id: 1 });
});

it(addSubRouterTest, "should merge the nested documentation", () => {
  const child = new Router();
  child.addAction({
    path: "/users/:id",
    method: "GET",
    handler: () => successResult({ id: 1 }),
  });

  const parent = new Router({ basePath: "/api" });
  parent.addSubRouter(child);

  const docs = parent.nativeApiDocs.getOpenApiJsonDoc(docOptions);

  assertEquals(Object.keys(docs.paths), ["/api/users/{id}"]);
});

const addMiddlewareTest = describe("Router.addMiddleware");

it(
  addMiddlewareTest,
  "should run the middleware before the handler",
  async () => {
    const calls: string[] = [];
    const router = new Router();
    router.addMiddleware(async (_context, next) => {
      calls.push("middleware");
      await next();
    });
    router.addAction({
      path: "/users",
      method: "GET",
      handler: () => {
        calls.push("handler");
        return successResult({ id: 1 });
      },
    });

    const response = await router.nativeRouter.fetch(request("/users"));

    assertEquals(response.status, 200);
    assertEquals(calls, ["middleware", "handler"]);
  },
);

it(
  addMiddlewareTest,
  "should short circuit when the middleware responds",
  async () => {
    const calls: string[] = [];
    const router = new Router();
    router.addMiddleware(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        }),
      )
    );
    router.addAction({
      path: "/users",
      method: "GET",
      handler: () => {
        calls.push("handler");
        return successResult({ id: 1 });
      },
    });

    const response = await router.nativeRouter.fetch(request("/users"));

    assertEquals(response.status, 401);
    assertEquals(await response.json(), { error: "Unauthorized" });
    assertEquals(calls, []);
  },
);
