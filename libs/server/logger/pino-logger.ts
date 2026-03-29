import pino from "@pino/pino";
import type {
  Logger,
  LoggerConfig,
  LoggerPayload,
  LogLevel,
} from "@serverx/utils";

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

  debug(message: string, payload?: LoggerPayload): void {
    this.#pinoInstance.debug(
      payload?.fields ?? {},
      message,
      ...(payload?.args ?? []),
    );
  }

  info(message: string, payload?: LoggerPayload): void {
    this.#pinoInstance.info(
      payload?.fields ?? {},
      message,
      ...(payload?.args ?? []),
    );
  }

  warn(message: string, payload?: LoggerPayload): void {
    this.#pinoInstance.warn(
      payload?.fields ?? {},
      message,
      ...(payload?.args ?? []),
    );
  }

  error(message: string, payload?: LoggerPayload): void {
    this.#pinoInstance.error(
      payload?.fields ?? {},
      message,
      ...(payload?.args ?? []),
    );
  }
}
