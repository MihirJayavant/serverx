import type { MiddlewareHandler } from "@hono/hono";
import { logger as honoLogger } from "@hono/hono/logger";
import type { LoggerConfig } from "@serverx/utils";
import { PinoLogger } from "../logger/pino-logger.ts";

export function useLogger(config?: LoggerConfig): MiddlewareHandler {
  const pinoLogger = new PinoLogger(config);
  const customLogger = (message: string, ...rest: string[]) => {
    pinoLogger.info(message, { rest });
  };
  return honoLogger(customLogger);
}
