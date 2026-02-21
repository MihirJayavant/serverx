import { assertEquals, assertRejects } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { HttpClient } from "./client.ts";
import { CircuitBreaker } from "./circuit-breaker.ts";

const baseUrl = "https://api.example.com";

describe("HttpClient", () => {
  it("should perform a GET request and return JSON", async () => {
    const mockData = { id: 1, name: "Test" };
    const fetchStub = stub(
      globalThis,
      "fetch",
      () =>
        Promise.resolve(
          new Response(JSON.stringify(mockData), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
    );

    try {
      const client = new HttpClient({ baseUrl });
      const result = await client.get<{ id: number; name: string }>("/users/1");

      assertEquals(result, mockData);
      const [url, init] = fetchStub.calls[0].args as [
        string | URL,
        RequestInit | undefined,
      ];
      assertEquals(url.toString(), "https://api.example.com/users/1");
      assertEquals(init?.method, "GET");
      const headers = init?.headers as Record<string, string>;
      assertEquals(headers["Content-Type"], "application/json");
    } finally {
      fetchStub.restore();
    }
  });

  it("should perform a POST request with body", async () => {
    const mockData = { id: 1 };
    const requestBody = { name: "New User" };
    const fetchStub = stub(
      globalThis,
      "fetch",
      () =>
        Promise.resolve(
          new Response(JSON.stringify(mockData), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          }),
        ),
    );

    try {
      const client = new HttpClient({ baseUrl });
      const result = await client.post<{ name: string }, { id: number }>(
        "/users",
        requestBody,
      );

      assertEquals(result, mockData);
      const [url, init] = fetchStub.calls[0].args as [
        string | URL,
        RequestInit | undefined,
      ];
      assertEquals(url.toString(), "https://api.example.com/users");
      assertEquals(init?.method, "POST");
      assertEquals(init?.body, JSON.stringify(requestBody));
    } finally {
      fetchStub.restore();
    }
  });

  it("should handle 204 No Content", async () => {
    const fetchStub = stub(
      globalThis,
      "fetch",
      () =>
        Promise.resolve(
          new Response(null, {
            status: 204,
          }),
        ),
    );

    try {
      const client = new HttpClient({ baseUrl });
      const result = await client.get("/empty");

      assertEquals(result, undefined);
    } finally {
      fetchStub.restore();
    }
  });

  it("should throw error for server errors (>= 500) to trigger retry", async () => {
    const fetchStub = stub(
      globalThis,
      "fetch",
      () =>
        Promise.resolve(
          new Response("Internal Server Error", {
            status: 500,
          }),
        ),
    );

    try {
      const client = new HttpClient({ baseUrl });
      await assertRejects(
        () => client.get("/error"),
        Error,
        "Server Error: 500",
      );
    } finally {
      fetchStub.restore();
    }
  });

  it("should merge default and request headers", async () => {
    const fetchStub = stub(
      globalThis,
      "fetch",
      () =>
        Promise.resolve(
          new Response(JSON.stringify({}), { status: 200 }),
        ),
    );

    try {
      const client = new HttpClient({
        baseUrl,
        headers: { "X-Custom": "default", "Authorization": "Bearer token" },
      });
      await client.get("/test", {
        headers: { "X-Request": "local", "X-Custom": "override" },
      });

      const init = fetchStub.calls[0].args[1] as RequestInit;
      const headers = init?.headers as Record<string, string>;
      assertEquals(headers["X-Custom"], "override");
      assertEquals(headers["Authorization"], "Bearer token");
      assertEquals(headers["X-Request"], "local");
      assertEquals(headers["Content-Type"], "application/json");
    } finally {
      fetchStub.restore();
    }
  });

  it("should use circuit breaker if provided", async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 1000,
    });

    const fetchStub = stub(
      globalThis,
      "fetch",
      () =>
        Promise.resolve(
          new Response(JSON.stringify({ success: true }), { status: 200 }),
        ),
    );

    try {
      const client = new HttpClient({ baseUrl, circuitBreaker: breaker });
      const result = await client.get("/test");

      assertEquals(result, { success: true });
      assertEquals(fetchStub.calls.length, 1);
    } finally {
      fetchStub.restore();
    }
  });

  it("should use retry logic if retryOptions are provided", async () => {
    let callCount = 0;
    const fetchStub = stub(
      globalThis,
      "fetch",
      () => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(new Response(null, { status: 500 }));
        }
        return Promise.resolve(
          new Response(JSON.stringify({ ok: true }), { status: 200 }),
        );
      },
    );

    try {
      const client = new HttpClient({
        baseUrl,
        retryOptions: { maxRetries: 2, delayMs: 1 },
      });
      const result = await client.get("/test");

      assertEquals(result, { ok: true });
      assertEquals(callCount, 2);
    } finally {
      fetchStub.restore();
    }
  });

  it("should perform PUT, PATCH, and DELETE requests", async () => {
    const fetchStub = stub(
      globalThis,
      "fetch",
      () =>
        Promise.resolve(
          new Response(JSON.stringify({ ok: true }), { status: 200 }),
        ),
    );

    try {
      const client = new HttpClient({ baseUrl });

      await client.put("/users/1", { name: "Updated" });
      const putInit = fetchStub.calls[0].args[1] as RequestInit;
      assertEquals(putInit?.method, "PUT");
      assertEquals(putInit?.body, JSON.stringify({ name: "Updated" }));

      await client.patch("/users/1", { name: "Patched" });
      const patchInit = fetchStub.calls[1].args[1] as RequestInit;
      assertEquals(patchInit?.method, "PATCH");
      assertEquals(patchInit?.body, JSON.stringify({ name: "Patched" }));

      await client.delete("/users/1");
      const deleteInit = fetchStub.calls[2].args[1] as RequestInit;
      assertEquals(deleteInit?.method, "DELETE");
      // DELETE should not have a body in this implementation
      assertEquals(deleteInit?.body, undefined);
    } finally {
      fetchStub.restore();
    }
  });
});
