import type { Context } from "@hono/hono";
import { openApiResponse } from "@serverx/utils";

export type HealthCheckDependency = {
  name: string;
  check: () => Promise<boolean>;
};

export type HealthCheckOptions = {
  dependencies?: HealthCheckDependency[];
};

export function healthCheckMiddleware(options: HealthCheckOptions = {}) {
  return async (c: Context) => {
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

      c.json({
        status: allHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        checks: results,
        systemMetrics,
      }, { status: allHealthy ? 200 : 500 });
    } catch (error) {
      c.json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error,
      }, { status: 500 });
    }
  };
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
