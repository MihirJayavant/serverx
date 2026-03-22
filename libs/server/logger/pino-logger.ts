import pino from "@pino/pino";
import type { Logger, LoggerConfig, LogLevel } from "@serverx/utils";

/**
 * Pino-based logger implementation
 */
export class PinoLogger implements Logger {
  #pinoInstance: ReturnType<typeof pino>;
  #logLevel: LogLevel;

  constructor(config?: LoggerConfig) {
    this.#logLevel = config?.level ?? "info";
    this.#pinoInstance = pino({
      level: this.#logLevel,
    });
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.#pinoInstance.debug(data ?? {}, message);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.#pinoInstance.info(data ?? {}, message);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.#pinoInstance.warn(data ?? {}, message);
  }

  error(message: string, error?: Error | Record<string, unknown>): void {
    if (error instanceof Error) {
      this.#pinoInstance.error(
        {
          err: error,
          stack: error.stack,
        },
        message,
      );
    } else {
      this.#pinoInstance.error(error ?? {}, message);
    }
  }
}
