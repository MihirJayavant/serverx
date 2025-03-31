import {
  errorResult,
  openApiResponse,
  statusCodes,
  successResult,
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

async function handler(options: HealthCheckOptions = {}) {
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

export function healthCheckBaseHandler(options: HealthCheckOptions = {}) {
  return baseHandler({
    handler: () => handler(options),
    validationSchema: z.any(),
  });
}

export function healthCheckResponse() {
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
