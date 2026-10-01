import { assert, assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { isError, isSuccess } from "@serverx/utils";
import { healthCheckHandler, healthCheckResponse } from "./healthcheck.ts";
import type { HealthCheckResponse } from "./healthcheck.ts";
import type { SystemMetricsProvider } from "./system-metrics.ts";

const metrics = { cpuLoad: 1.5, freeMemory: 1024, totalMemory: 4096 };
const systemMetrics: SystemMetricsProvider = () => metrics;

const healthCheckHandlerTest = describe(healthCheckHandler.name);

it(
  healthCheckHandlerTest,
  "should be healthy without dependencies",
  async () => {
    const result = await healthCheckHandler({ systemMetrics });

    assert(isSuccess(result));
    assertExists(result.data);
    assertEquals(result.status, 200);
    assertEquals(result.data.status, "healthy");
    assertEquals(result.data.checks, []);
  },
);

it(
  healthCheckHandlerTest,
  "should report every healthy dependency",
  async () => {
    const result = await healthCheckHandler({
      systemMetrics,
      dependencies: [
        { name: "database", check: () => Promise.resolve(true) },
        { name: "cache", check: () => Promise.resolve(true) },
      ],
    });

    assert(isSuccess(result));
    assertExists(result.data);
    assertEquals(result.data.status, "healthy");
    assertEquals(result.data.checks, [
      { name: "database", healthy: true },
      { name: "cache", healthy: true },
    ]);
  },
);

it(
  healthCheckHandlerTest,
  "should be unhealthy when a dependency fails",
  async () => {
    const result = await healthCheckHandler({
      systemMetrics,
      dependencies: [
        { name: "database", check: () => Promise.resolve(true) },
        { name: "cache", check: () => Promise.resolve(false) },
      ],
    });

    assert(isError(result));
    assertEquals(result.status, 500);
    const error = result.error as HealthCheckResponse;
    assertEquals(error.status, "unhealthy");
    assertEquals(error.checks, [
      { name: "database", healthy: true },
      { name: "cache", healthy: false },
    ]);
  },
);

it(
  healthCheckHandlerTest,
  "should be unhealthy when a dependency throws",
  async () => {
    const result = await healthCheckHandler({
      systemMetrics,
      dependencies: [
        { name: "database", check: () => Promise.reject(new Error("down")) },
      ],
    });

    assert(isError(result));
    assertEquals(result.status, 500);
    const error = result.error as { status: string; error: Error };
    assertEquals(error.status, "unhealthy");
    assertEquals(error.error.message, "down");
  },
);

it(
  healthCheckHandlerTest,
  "should return the provided system metrics",
  async () => {
    const result = await healthCheckHandler({ systemMetrics });

    assert(isSuccess(result));
    assertExists(result.data);
    assertEquals(result.data.systemMetrics, metrics);
  },
);

it(healthCheckHandlerTest, "should return an iso timestamp", async () => {
  const result = await healthCheckHandler({ systemMetrics });

  assert(isSuccess(result));
  assertExists(result.data);
  const { timestamp } = result.data;
  assertEquals(new Date(timestamp).toISOString(), timestamp);
});

const healthCheckResponseTest = describe(healthCheckResponse.name);

it(
  healthCheckResponseTest,
  "should describe the healthy and unhealthy responses",
  () => {
    const responses = healthCheckResponse();

    assertEquals(Object.keys(responses), ["200", "500"]);
    assertEquals(responses["200"].description, "Health Check");
    assertEquals(responses["500"].description, "Health Check");
  },
);

it(
  healthCheckResponseTest,
  "should require the healthy response fields",
  () => {
    const schema = healthCheckResponse()["200"]
      .content["application/json"].schema;

    assert(schema.type === "object");
    assertEquals(schema.required, [
      "status",
      "timestamp",
      "checks",
      "systemMetrics",
    ]);
    assertEquals(Object.keys(schema.properties), [
      "status",
      "timestamp",
      "checks",
      "systemMetrics",
    ]);
  },
);

it(
  healthCheckResponseTest,
  "should require the unhealthy response fields",
  () => {
    const schema = healthCheckResponse()["500"]
      .content["application/json"].schema;

    assert(schema.type === "object");
    assertEquals(schema.required, ["status", "timestamp", "error"]);
    assertEquals(Object.keys(schema.properties), [
      "status",
      "timestamp",
      "error",
    ]);
  },
);
