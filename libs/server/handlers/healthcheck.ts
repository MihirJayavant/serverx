import {
  errorResult,
  type OpenApiResponse,
  openApiResponse,
  type Result,
  statusCodes,
  successResult,
  type Task,
} from "@serverx/utils";
import { baseHandler } from "../router/request-handler.ts";
import {
  defaultSystemMetricsProvider,
  type SystemMetricsProvider,
} from "./system-metrics.ts";
import { z } from "@zod/zod";

/** A named dependency probed during a health check. */
export type HealthCheckDependency = {
  /** Identifier for the dependency in the health response. */
  name: string;
  /** Returns `true` when the dependency is healthy. */
  check: () => Promise<boolean>;
};

/** Options controlling {@link healthCheckHandler}. */
export type HealthCheckOptions = {
  /** Dependencies to probe; all must pass for an overall healthy status. */
  dependencies?: HealthCheckDependency[];
  /**
   * Override how system metrics are gathered. Defaults to a runtime-detecting
   * provider that uses Deno APIs on Deno and `node:os` on Node.js.
   */
  systemMetrics?: SystemMetricsProvider;
};

/** Payload returned by the health check endpoint. */
export type HealthCheckResponse = {
  /** Overall status, `"healthy"` or `"unhealthy"`. */
  status: string;
  /** ISO timestamp of when the check ran. */
  timestamp: string;
  /** Per-dependency results. */
  checks: {
    name: string;
    healthy: boolean;
  }[];
  /** Snapshot of system resource usage. */
  systemMetrics: {
    cpuLoad: number;
    freeMemory: number;
    totalMemory: number;
  };
};

async function handler(
  options: HealthCheckOptions = {},
): Promise<Result<HealthCheckResponse>> {
  try {
    const checks = options.dependencies?.map(async (dep) => ({
      name: dep.name,
      healthy: await dep.check(),
    })) ?? [];

    const results = await Promise.all(checks);
    const allHealthy = results.every((r) => r.healthy);

    const provider = options.systemMetrics ?? defaultSystemMetricsProvider;
    const systemMetrics = await provider();

    const response = {
      timestamp: new Date().toISOString(),
      checks: results,
      systemMetrics,
    };

    if (!allHealthy) {
      return errorResult({
        ...response,
        status: "unhealthy",
      }, statusCodes.InternalServerError);
    }

    return successResult({
      ...response,
      status: "healthy",
    });
  } catch (error) {
    return errorResult({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error,
    }, statusCodes.InternalServerError);
  }
}

/**
 * Run the health check: probe every configured dependency and gather system
 * metrics. Returns a success {@link Result} when all dependencies are healthy,
 * otherwise an error result with `500 Internal Server Error`.
 */
export function healthCheckHandler(
  options: HealthCheckOptions = {},
): Task<Result<HealthCheckResponse>> {
  const h = baseHandler({
    handler: () => handler(options),
    validationSchema: z.any(),
  });
  return h(undefined);
}

/**
 * Build the OpenAPI `responses` metadata for the health check endpoint,
 * describing both the `200` healthy and `500` unhealthy payloads.
 */
export function healthCheckResponse(): OpenApiResponse {
  return openApiResponse({
    status: 200,
    description: "Health Check",
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
        },
        timestamp: {
          type: "string",
        },
        checks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              healthy: {
                type: "boolean",
              },
            },
            required: ["name", "healthy"],
          },
        },
        systemMetrics: {
          type: "object",
          properties: {
            cpuLoad: {
              type: "number",
            },
            freeMemory: {
              type: "number",
            },
            totalMemory: {
              type: "number",
            },
          },
          required: ["cpuLoad", "freeMemory", "totalMemory"],
        },
      },
      required: ["status", "timestamp", "checks", "systemMetrics"],
    },
  }, {
    status: 500,
    description: "Health Check",
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
        },
        timestamp: {
          type: "string",
        },
        error: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            message: {
              type: "string",
            },
          },
        },
      },
      required: ["status", "timestamp", "error"],
    },
  });
}
