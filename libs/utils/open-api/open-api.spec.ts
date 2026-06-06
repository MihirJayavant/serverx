import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { OpenApi, type OpenApiUiOption } from "./open-api.ts";
import { httpMethods } from "../result/methods.ts";

const uiOptions: OpenApiUiOption = {
  url: "/docs",
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Test API",
  },
};

const addActionTest = describe("OpenApi.addAction");

it(addActionTest, "should add an action with defaults applied", () => {
  const openApi = new OpenApi();
  openApi.addAction({ path: "/users", method: httpMethods.GET });

  const doc = openApi.getOpenApiJsonDoc(uiOptions);
  assertEquals(doc.paths, {
    "/users": {
      get: {
        method: httpMethods.GET,
        path: "/users",
        tags: [],
        description: "",
        parameters: [],
        responses: {},
        requestBody: {},
      },
    },
  });
});

it(addActionTest, "should convert :param path segments to {param}", () => {
  const openApi = new OpenApi();
  openApi.addAction({ path: "/users/:userId", method: httpMethods.GET });

  const doc = openApi.getOpenApiJsonDoc(uiOptions);
  assertEquals(Object.keys(doc.paths), ["/users/{userId}"]);
});

it(addActionTest, "should convert multiple :param segments", () => {
  const openApi = new OpenApi();
  openApi.addAction({
    path: "/users/:userId/posts/:postId",
    method: httpMethods.GET,
  });

  const doc = openApi.getOpenApiJsonDoc(uiOptions);
  assertEquals(Object.keys(doc.paths), ["/users/{userId}/posts/{postId}"]);
});

it(addActionTest, "should prefix the path with basePath", () => {
  const openApi = new OpenApi();
  openApi.addAction({
    path: "/:userId",
    method: httpMethods.GET,
    basePath: "/users",
  });

  const doc = openApi.getOpenApiJsonDoc(uiOptions);
  assertEquals(Object.keys(doc.paths), ["/users/{userId}"]);
});

it(
  addActionTest,
  "should treat a root '/' path as empty so only basePath remains",
  () => {
    const openApi = new OpenApi();
    openApi.addAction({
      path: "/",
      method: httpMethods.GET,
      basePath: "/users",
    });

    const doc = openApi.getOpenApiJsonDoc(uiOptions);
    assertEquals(Object.keys(doc.paths), ["/users"]);
  },
);

it(addActionTest, "should preserve provided metadata", () => {
  const openApi = new OpenApi();
  openApi.addAction({
    path: "/users",
    method: httpMethods.POST,
    tags: ["users"],
    description: "Create a user",
    parameters: [{ name: "userId" }],
    responses: { "201": { description: "Created" } },
    requestBody: { description: "User payload" },
  });

  const doc = openApi.getOpenApiJsonDoc(uiOptions);
  assertEquals(doc.paths["/users"].post, {
    method: httpMethods.POST,
    path: "/users",
    tags: ["users"],
    description: "Create a user",
    parameters: [{ name: "userId" }],
    responses: { "201": { description: "Created" } },
    requestBody: { description: "User payload" },
  });
});

it(
  addActionTest,
  "should group multiple methods under the same path",
  () => {
    const openApi = new OpenApi();
    openApi.addAction({ path: "/users", method: httpMethods.GET });
    openApi.addAction({ path: "/users", method: httpMethods.POST });

    const doc = openApi.getOpenApiJsonDoc(uiOptions);
    assertEquals(Object.keys(doc.paths["/users"]).sort(), ["get", "post"]);
  },
);

const getOpenApiJsonDocTest = describe("OpenApi.getOpenApiJsonDoc");

it(
  getOpenApiJsonDocTest,
  "should return openapi version and info, omitting url",
  () => {
    const openApi = new OpenApi();
    const doc = openApi.getOpenApiJsonDoc(uiOptions);

    assertEquals(doc.openapi, "3.0.0");
    assertEquals(doc.info, { version: "1.0.0", title: "Test API" });
    assertEquals("url" in doc, false);
  },
);

it(getOpenApiJsonDocTest, "should return empty paths when no actions", () => {
  const openApi = new OpenApi();
  const doc = openApi.getOpenApiJsonDoc(uiOptions);
  assertEquals(doc.paths, {});
});

const addSubOpenApiTest = describe("OpenApi.addSubOpenApi");

it(addSubOpenApiTest, "should merge sub actions with a basePath", () => {
  const sub = new OpenApi();
  sub.addAction({ path: "/:userId", method: httpMethods.GET });

  const root = new OpenApi();
  root.addSubOpenApi({ route: "users", openApi: sub, basePath: "/users" });

  const doc = root.getOpenApiJsonDoc(uiOptions);
  assertEquals(Object.keys(doc.paths), ["/users/{userId}"]);
});

it(
  addSubOpenApiTest,
  "should merge sub actions unchanged when no basePath is given",
  () => {
    const sub = new OpenApi();
    sub.addAction({ path: "/users/:userId", method: httpMethods.DELETE });

    const root = new OpenApi();
    root.addSubOpenApi({ route: "users", openApi: sub });

    const doc = root.getOpenApiJsonDoc(uiOptions);
    assertEquals(Object.keys(doc.paths), ["/users/{userId}"]);
    assertEquals(
      doc.paths["/users/{userId}"].delete.method,
      httpMethods.DELETE,
    );
  },
);
