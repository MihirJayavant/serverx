/**
 * @file pino-logger.ts
 * Pino-backed implementation of the Logger interface
 */

import pino from "@pino/pino";
import type {
  Logger,
  LoggerConfig,
  LoggerPayload,
  LogLevel,
} from "@serverx/utils";

/**
 * Pino-backed {@link Logger}. Each method takes a message plus an optional
 * payload whose `fields` are merged into the structured log entry and whose
 * `args` fill the message's format placeholders.
 *
 * @example
 * ```ts
 * const logger = new PinoLogger({ level: "debug" });
 *
 * logger.info("User %s created", {
 *   args: [user.id],
 *   fields: { userId: user.id },
 * });
 * ```
 */
export class PinoLogger implements Logger {
  #pinoInstance: ReturnType<typeof pino>;
  #logLevel: LogLevel;

  /**
   * @param config - Optional logger configuration; `level` defaults to
   * `"info"`.
   */
  constructor(config?: LoggerConfig) {
    this.#logLevel = config?.level ?? "info";
    this.#pinoInstance = pino({
      level: this.#logLevel,
    });
  }

  /** Log a message at debug level. */
  debug(message: string, payload?: LoggerPayload): void {
    this.#pinoInstance.debug(
      payload?.fields ?? {},
      message,
      ...(payload?.args ?? []),
    );
  }

  /** Log a message at info level. */
  info(message: string, payload?: LoggerPayload): void {
    this.#pinoInstance.info(
      payload?.fields ?? {},
      message,
      ...(payload?.args ?? []),
    );
  }

  /** Log a message at warn level. */
  warn(message: string, payload?: LoggerPayload): void {
    this.#pinoInstance.warn(
      payload?.fields ?? {},
      message,
      ...(payload?.args ?? []),
    );
  }

  /** Log a message at error level. */
  error(message: string, payload?: LoggerPayload): void {
    this.#pinoInstance.error(
      payload?.fields ?? {},
      message,
      ...(payload?.args ?? []),
    );
  }
}
