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
import { z } from "@zod/zod";

export type HealthCheckDependency = {
  name: string;
  check: () => Promise<boolean>;
};

export type HealthCheckOptions = {
  dependencies?: HealthCheckDependency[];
};

export type HealthCheckResponse = {
  status: string;
  timestamp: string;
  checks: {
    name: string;
    healthy: boolean;
  }[];
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

    const memoryInfo = Deno.systemMemoryInfo();

    const systemMetrics = {
      cpuLoad: Deno.loadavg()[0], // 1-minute load average
      freeMemory: memoryInfo.free,
      totalMemory: memoryInfo.total,
    };

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

export function healthCheckHandler(
  options: HealthCheckOptions = {},
): Task<Result<HealthCheckResponse>> {
  const h = baseHandler({
    handler: () => handler(options),
    validationSchema: z.any(),
  });
  return h(undefined);
}

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
