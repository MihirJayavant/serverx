import type { MiddlewareHandler } from "@hono/hono";
import type { LoggerConfig } from "@serverx/utils";
import { PinoLogger } from "../logger/pino-logger.ts";

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
