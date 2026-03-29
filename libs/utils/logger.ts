/**
 * Logger interface for structured logging
 * Implementations can use different logging libraries (pino, winston, bunyan, etc.)
 */

/**
 * Log levels supported by the logger
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

export type LoggerPayload = {
  args?: unknown[];
  fields?: Record<string, unknown>;
};

/**
 * Logger type for structured logging
 */
export type Logger = {
  /**
   * Log a debug message
   */
  debug(message: string, payload?: LoggerPayload): void;

  /**
   * Log an info message
   */
  info(message: string, payload?: LoggerPayload): void;

  /**
   * Log a warning message
   */
  warn(message: string, payload: LoggerPayload): void;

  /**
   * Log an error message
   */
  error(message: string, payload?: LoggerPayload): void;
};

/**
 * Logger configuration options
 */
export type LoggerConfig = {
  /**
   * Minimum log level to output
   * @default "info"
   */
  level?: LogLevel;
};
