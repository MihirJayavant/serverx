import type { MiddlewareHandler } from "@hono/hono";
import type { LoggerConfig } from "@serverx/utils";
import { PinoLogger } from "../logger/pino-logger.ts";

/**
 * Middleware that logs each incoming request (method, URL, headers, params,
 * and query) using a {@link PinoLogger} at debug level.
 *
 * One logger is created per call, so register the middleware once and reuse it.
 * Because requests are logged at debug level, set `level: "debug"` to see them.
 *
 * @param config - Optional logger configuration; `level` defaults to `"info"`.
 *
 * @example
 * ```ts
 * app.addMiddleware(useLogger({ level: "debug" }));
 * ```
 */
export function useLogger(config?: LoggerConfig): MiddlewareHandler {
  const pinoLogger = new PinoLogger(config);
  return async (c, next) => {
    pinoLogger.debug(`Incoming request: %s %s`, {
      args: [c.req.method, c.req.url],
      fields: {
        method: c.req.method,
        url: c.req.url,
        header: c.req.header,
        param: c.req.param,
        query: c.req.query(),
      },
    });
    await next();
  };
}
