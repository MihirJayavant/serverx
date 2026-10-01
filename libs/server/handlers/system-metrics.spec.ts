import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { defaultSystemMetricsProvider } from "./system-metrics.ts";

const loadAverage: [number, number, number] = [1.5, 2.5, 3.5];

const defaultSystemMetricsProviderTest = describe(
  "defaultSystemMetricsProvider",
);

it(
  defaultSystemMetricsProviderTest,
  "should read metrics from deno",
  async () => {
    const loadavg = stub(Deno, "loadavg", () => loadAverage);
    const memoryInfo = stub(Deno, "systemMemoryInfo", () => ({
      total: 4096,
      free: 1024,
      available: 2048,
      buffers: 0,
      cached: 0,
      swapTotal: 0,
      swapFree: 0,
    }));

    try {
      const metrics = await defaultSystemMetricsProvider();

      assertEquals(metrics, {
        cpuLoad: 1.5,
        freeMemory: 1024,
        totalMemory: 4096,
      });
    } finally {
      loadavg.restore();
      memoryInfo.restore();
    }
  },
);
