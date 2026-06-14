/**
 * System metrics reported by the health check, captured in a runtime-neutral
 * shape so the same handler works on Deno and Node.js.
 */
export type SystemMetrics = {
  /** 1-minute CPU load average. */
  cpuLoad: number;
  /** Free system memory in bytes. */
  freeMemory: number;
  /** Total system memory in bytes. */
  totalMemory: number;
};

/**
 * Supplies {@link SystemMetrics}. Override the default to source metrics from a
 * custom location or to make the health check deterministic in tests.
 */
export type SystemMetricsProvider = () =>
  | SystemMetrics
  | Promise<SystemMetrics>;

/**
 * Default provider. Uses {@link Deno} APIs when running on Deno and falls back
 * to `node:os` on Node.js.
 */
export const defaultSystemMetricsProvider: SystemMetricsProvider = async () => {
  if (
    typeof Deno !== "undefined" &&
    typeof Deno.systemMemoryInfo === "function"
  ) {
    const memoryInfo = Deno.systemMemoryInfo();
    return {
      cpuLoad: Deno.loadavg()[0], // 1-minute load average
      freeMemory: memoryInfo.free,
      totalMemory: memoryInfo.total,
    };
  }

  const os = await import("node:os");
  return {
    cpuLoad: os.loadavg()[0], // 1-minute load average
    freeMemory: os.freemem(),
    totalMemory: os.totalmem(),
  };
};
